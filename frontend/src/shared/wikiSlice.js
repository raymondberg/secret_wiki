import { createSlice } from "@reduxjs/toolkit";

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
    updatePageBySlug: (state, message) => {
      const pageSlug = message.payload;
      if (pageSlug !== null) {
        state.page = state.pages.filter((p) => p.slug === pageSlug)[0];
      }
    },
    addPage: (state, message) => {
      const page = message.payload;
      const pagesBefore = state.pages.filter((p) => p.title < page.title);
      const pagesAfter = state.pages.filter((p) => p.title > page.title);
      state.page = page;
      state.pages = pagesBefore.concat([page]).concat(pagesAfter);
    },
    invalidatePagesCache: (state, message) => {
      state.page = null;
      state.pages = [];
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
  updatePage,
  updatePageBySlug,
  updatePages,
  updateWiki,
  updateWikiBySlug,
  updateWikis,
} = wikiSlice.actions;

export default wikiSlice.reducer;
