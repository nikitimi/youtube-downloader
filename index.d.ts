declare module "@vreden/youtube_scraper" {
  async function ytmp3<T>(link: T, formats?: number) {
    return {
      status: true,
      creator: "",
      metadata: undefined as any,
      download: {} as Record<string, any>,
      message: undefined,
    };
  }
  export { ytmp3 };
}
