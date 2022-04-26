import { createSlice } from "@reduxjs/toolkit";
import allDefined from "../common.js";

export const wikiSlice = createSlice({
  name: "wiki",
  initialState: {
    wiki: null,
    wikis: [],
    page: null,
    pages: [],
  },
  reducers: {
    updatePage: (state, message) => {
      state.page = message.payload;
    },
    pickPageBySlug: (state, message) => {
      const pageSlug = message.payload;
      if (pageSlug === null) {
        state.page = null;
      } else {
        state.page = state.pages.filter((p) => p.slug === pageSlug)[0];
      }
    },
    updatePageBySlug: (state, message) => {
      const pageSlug = message.payload.slug;
      const page = message.payload.data;
      if (allDefined(pageSlug, page)) {
        state.page = page;
        state.pages = state.pages
          .filter((p) => p.slug !== pageSlug)
          .concat([page]);
      }
    },
    addPage: (state, message) => {
      const page = message.payload;
      state.page = page;
      state.pages = state.pages.concat([page]);
    },
    invalidatePagesCache: (state, message) => {
      state.page = null;
      state.pages = state.pages.map((x) => x);
    },
    updatePages: (state, message) => {
      state.pages = message.payload;
      if (state.page !== null && state.page !== undefined) {
        state.page = state.pages.filter((p) => p.id === state.page.id);
      }
    },
    updateWiki: (state, message) => {
      state.page = null;
      state.wiki = Object.assign(
        {
          last_probe_time: Date.now(),
        },
        message.payload
      );
    },
    updateWikis: (state, message) => {
      state.wikis = message.payload;
      if (state.wiki !== null) {
        state.page = null;
        state.wiki = state.wikis.filter((p) => p.id === state.wiki.id);
      }
    },
    updateWikiBySlug: (state, message) => {
      const wikiSlug = message.payload;
      if (wikiSlug !== null) {
        state.wiki = state.wikis.filter((p) => p.slug === wikiSlug)[0];
      }
    },
  },
});

export const {
  addPage,
  invalidatePagesCache,
  pickPageBySlug,
  updatePage,
  updatePageBySlug,
  updatePages,
  updateWiki,
  updateWikiBySlug,
  updateWikis,
} = wikiSlice.actions;

export default wikiSlice.reducer;
