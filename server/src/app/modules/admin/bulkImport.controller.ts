import { Request, Response } from "express";
import { hashPhone } from "../../utils/phoneHash";
import prisma from "../../config/prisma";
import { matchingService } from "../aiMatches/matching.service";

function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (char === '"') {
      if (quoted && input[i + 1] === '"') { cell += '"'; i++; }
      else quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell); cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && input[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
    } else cell += char;
  }
  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

export const bulkImport = async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ success: false, message: "Choose a CSV file to import." });
  try {
    const content = req.file.buffer.toString("utf8").replace(/^\uFEFF/, "");
    const rows = parseCsv(content);
    if (rows.length < 2) return res.status(400).json({ success: false, message: "The CSV must contain a header and at least one data row." });
    const headers = rows[0].map((value) => value.trim().toLowerCase());
    const required = ["type", "useremail", "categoryname", "itemname", "description", "location", "date"];
    const missing = required.filter((key) => !headers.includes(key));
    if (missing.length) return res.status(400).json({ success: false, message: `Missing CSV columns: ${missing.join(", ")}` });
    if (rows.length - 1 > 100) return res.status(413).json({ success: false, message: "Import up to 100 records per CSV file." });

    const index = (key: string) => headers.indexOf(key);
    const lostIds: string[] = [];
    const foundIds: string[] = [];
    const errors: Array<{ row: number; message: string }> = [];
    let importedLost = 0;
    let importedFound = 0;

    for (let rowNumber = 1; rowNumber < rows.length; rowNumber++) {
      const cells = rows[rowNumber];
      const value = (key: string) => (cells[index(key)] || "").trim();
      try {
        const type = value("type").toUpperCase();
        const email = value("useremail").toLowerCase();
        const categoryName = value("categoryname");
        const itemName = value("itemname");
        const description = value("description");
        const location = value("location");
        const date = new Date(value("date"));
        const imageUrl = headers.includes("imageurl") ? value("imageurl") : "";
        if (!["LOST", "FOUND"].includes(type)) throw new Error("type must be LOST or FOUND");
        if (!itemName || !description || !location || Number.isNaN(date.getTime())) throw new Error("itemName, description, location and a valid date are required");
        if (imageUrl && !/^https:\/\//i.test(imageUrl)) throw new Error("imageUrl must use HTTPS");
        const [user, category] = await Promise.all([
          prisma.user.findFirst({ where: { email, isDeleted: false }, select: { id: true } }),
          prisma.itemCategory.findFirst({ where: { name: { equals: categoryName, mode: "insensitive" } }, select: { id: true } }),
        ]);
        if (!user) throw new Error(`No active user found for ${email}`);
        if (!category) throw new Error(`Unknown category: ${categoryName}`);
        const contactName = headers.includes("contactname") ? value("contactname") : "";
        const contactPhone = headers.includes("contactphone") ? value("contactphone") : "";
        if (type === "LOST") {
          const item = await prisma.lostItem.create({ data: {
            userId: user.id, categoryId: category.id, lostItemName: itemName,
            description, location, date, img: imageUrl, contactName, contactPhone,
            contactPhoneHash: hashPhone(contactPhone),
          }, select: { id: true } });
          lostIds.push(item.id); importedLost++;
        } else {
          const item = await prisma.foundItem.create({ data: {
            userId: user.id, categoryId: category.id, foundItemName: itemName,
            description, location, date, img: imageUrl, contactName, contactPhone,
            claimProcess: headers.includes("claimprocess") ? value("claimprocess") : "Arrange a safe handover after ownership verification.",
            contactPhoneHash: hashPhone(contactPhone),
          }, select: { id: true } });
          foundIds.push(item.id); importedFound++;
        }
      } catch (error: any) {
        errors.push({ row: rowNumber + 1, message: error?.message || "Invalid row" });
      }
    }

    if (lostIds.length) {
      for (const id of lostIds) await matchingService.forLostItem(id, false).catch((error) => console.error("Bulk lost match failed:", error));
    } else {
      for (const id of foundIds) await matchingService.forFoundItem(id, false).catch((error) => console.error("Bulk found match failed:", error));
    }
    return res.json({
      success: true,
      message: "CSV import processed.",
      data: { importedLost, importedFound, failedRows: errors.length, errors },
    });
  } catch (error: any) {
    console.error("Bulk CSV import failed:", error);
    return res.status(500).json({ success: false, message: "Could not process the CSV file." });
  }
};
