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
    updatePages: (state, message) => {
      state.pages = message.payload;
      if (state.page !== null) {
        state.page = state.pages.filter((p) => p.id === state.page.id);
      }
    },
    updateWiki: (state, message) => {
      state.wiki = message.payload;
      state.page = null;
    },
    updateWikis: (state, message) => {
      state.wikis = message.payload;
      if (state.wiki !== null) {
        state.wiki = state.wikis.filter((p) => p.id === state.wiki.id);
        state.page = null;
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
  updatePage,
  updatePageBySlug,
  updatePages,
  updateWiki,
  updateWikiBySlug,
  updateWikis,
} = wikiSlice.actions;

export default wikiSlice.reducer;
