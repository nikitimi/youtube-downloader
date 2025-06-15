export default async function cdnInfo(
  url: string
): Promise<null | { data: string }> {
  try {
    const response = await fetch("https://cdn302.savetube.su/v2/info", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        url,
      }),
    });

    if (!response.ok) {
      throw new Error("Response not ok.");
    }

    const json = await response.json();
    return json;
  } catch (err) {
    if (err instanceof Error) {
      console.warn(err.message);
    }
    return null;
  }
}
