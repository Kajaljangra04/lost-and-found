import { useForm } from "react-hook-form";
import { Spinner } from "flowbite-react";
import toastNotify from "../../components/modal/toastNotify";
import { useState } from "react";
import {
  useCategoryQuery,
  useCreateFoundItemMutation,
} from "../../redux/api/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { IoIosArrowDown } from "react-icons/io";
import { FaBullhorn } from "react-icons/fa";
import type { ItemCategory } from "../../types/types";

type ReportFoundForm = {
  imgUrl: string;
  foundItemName: string;
  description: string;
  location: string;
  claimProcess: string;
};

const ReportFoundItem = () => {
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm<ReportFoundForm>();

  const [categoryId, setCategoryId] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [createFoundItem, { isLoading }] = useCreateFoundItemMutation();
  const { data: Category } = useCategoryQuery("");
  const [startDate, setStartDate] = useState(new Date());

  const onSubmit = async (data: ReportFoundForm) => {
    setSubmitted(true);
    if (!categoryId) return;

    try {
      const foundData = {
        img: data.imgUrl,
        categoryId,
        foundItemName: data.foundItemName,
        description: data.description,
        location: data.location,
        date: startDate,
        claimProcess: data.claimProcess,
      };

      const res = await createFoundItem(foundData);

      if (res?.data?.success == false) {
        toastNotify({ message: "Failed to create Found item", status: false });
      } else {
        toastNotify({ message: "Found item created successfully", status: true });
        reset();
        setCategoryId("");
        setSubmitted(false);
      }
    } catch {
      toastNotify({ message: "Failed to create Found item", status: false });
    }
  };

  return (
    <section className="page flex items-center justify-center px-4 py-12 sm:px-6">
      <div className="card w-full max-w-3xl p-6 md:p-8">
        <header className="mb-8 text-center">
          <span className="eyebrow">
            <FaBullhorn />
            Report a find
          </span>
          <h1 className="mt-3 text-2xl font-bold text-ink md:text-3xl">
            Report Found Item
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-dim md:text-base">
            Found something? Let the community know so it can find its way home.
          </p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="foundItemName" className="field-label">
                Found item name
              </label>
              <input
                id="foundItemName"
                {...register("foundItemName", {
                  required: "Found item name is required",
                })}
                type="text"
                className="field"
                placeholder="Laptop/Phone"
              />
              {errors.foundItemName && (
                <p className="field-error">
                  {errors.foundItemName?.message as string}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="description" className="field-label">
                Description
              </label>
              <input
                id="description"
                type="text"
                className="field"
                placeholder="What does it look like, color, brand"
                {...register("description", {
                  required: "Description is required",
                })}
              />
              {errors.description && (
                <p className="field-error">
                  {errors.description?.message as string}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="imgUrl" className="field-label">
                Image url
              </label>
              <input
                id="imgUrl"
                type="text"
                className="field"
                placeholder="http://found-image.com"
                {...register("imgUrl", {
                  required: "Image url is required",
                })}
              />
              {errors.imgUrl && (
                <p className="field-error">
                  {errors.imgUrl?.message as string}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="location" className="field-label">
                Location
              </label>
              <input
                id="location"
                type="text"
                className="field"
                placeholder="City, Country"
                {...register("location", {
                  required: "Location is required",
                })}
              />
              {errors.location && (
                <p className="field-error">
                  {errors.location?.message as string}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="claimProcess" className="field-label">
                Claim Process
              </label>
              <input
                id="claimProcess"
                type="text"
                className="field"
                placeholder="How should someone claim this item?"
                {...register("claimProcess", {
                  required: "Claim process is required",
                })}
              />
              {errors.claimProcess && (
                <p className="field-error">
                  {errors.claimProcess?.message as string}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="foundDate" className="field-label">
                Date
              </label>
              <DatePicker
                wrapperClassName="w-full"
                className="field"
                selected={startDate}
                onChange={(date) => {
                  if (date) setStartDate(date);
                }}
                dateFormat="yyyy-MM-dd"
                placeholderText="Select date"
                showYearDropdown
                showMonthDropdown
                dropdownMode="select"
                maxDate={new Date()}
              />
            </div>

            <div>
              <label htmlFor="category" className="field-label">
                Category
              </label>
              <div className="relative">
                <select
                  id="category"
                  className="field cursor-pointer appearance-none pr-10"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="" disabled className="bg-surface-2 text-ink-mute">
                    Select a category
                  </option>
                  {Category?.data?.map((category: ItemCategory) => (
                    <option
                      key={category?.id}
                      value={category?.id}
                      className="bg-surface-2 text-ink"
                    >
                      {category?.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-ink-mute">
                  <IoIosArrowDown className="h-4 w-4" />
                </div>
              </div>
              {submitted && !categoryId && (
                <p className="field-error">Category is required</p>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center">
              <Spinner size="lg" className="text-accent" />
            </div>
          ) : (
            <button type="submit" className="btn btn-brand w-full sm:w-auto">
              Submit Found Item
            </button>
          )}
        </form>
      </div>
    </section>
  );
};
export default ReportFoundItem;
