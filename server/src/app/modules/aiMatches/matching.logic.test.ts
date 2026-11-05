import test from "node:test";
import assert from "node:assert/strict";
import { scorePair, similarity, normalize } from "./matching.logic";

test("exactly matching item details score highly", () => {
  const result = scorePair(
    {
      name: "Black leather wallet",
      description: "Wallet with a silver logo",
      location: "College library",
    },
    {
      name: "Black leather wallet",
      description: "Wallet with a silver logo",
      location: "College library",
    }
  );

  assert.equal(result.score, 100);
  assert.equal(result.confidence, "HIGH");
});

test("missing contact data does not affect item similarity", () => {
  const result = scorePair(
    {
      name: "Blue backpack",
      description: "Blue bag with a red tag",
    },
    {
      name: "Blue backpack",
      description: "Blue bag with a red tag",
    }
  );

  assert.equal(result.score, 100);
});

test("different reporter phone hashes do not reduce item similarity", () => {
  const base = {
    name: "Black wallet",
    description: "Leather wallet",
    location: "College library",
  };

  const withoutContact = scorePair(base, base);

  const withDifferentContacts = scorePair(
    { ...base, contactPhoneHash: "hash-a", contactName: "Reporter A" },
    { ...base, contactPhoneHash: "hash-b", contactName: "Reporter B" }
  );

  assert.equal(withDifferentContacts.score, withoutContact.score);
});

test("semantic similarity can refine text matching", () => {
  const lost = {
    name: "wallet",
    description: "leather card holder",
  };

  const found = {
    name: "purse",
    description: "brown leather case",
  };

  const lexical = scorePair(lost, found);
  const semantic = scorePair(lost, found, 0.9);

  assert.ok(semantic.score > lexical.score);
});

test("similarity handles missing values without inventing a match", () => {
  assert.equal(similarity("", "black wallet"), null);
  assert.equal(similarity(null, "black wallet"), null);
});

test("normalization preserves Hindi and other Unicode letters", () => {
  assert.equal(normalize("काला बटुआ"), normalize("काला बटुआ"));
  assert.equal(similarity("काला बटुआ", "काला बटुआ"), 1);
});
