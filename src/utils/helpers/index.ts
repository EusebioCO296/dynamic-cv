import { monthsMap, t, type Lang } from "../../i18n/ui";

interface DateRange {
  startDate: string;
  endDate?: string | null;
  current?: boolean;
}

export const formatToMonthYearHelper = (date: Date, lang: Lang = "en") => {
  const months = monthsMap[lang];
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  return `${month}-${year}`;
};

export const formatDateRangeHelper = (dates: DateRange, lang: Lang = "en") => {
  const start = new Date(dates.startDate);
  const end = dates.endDate ? new Date(dates.endDate) : null;

  const formattedStart = isNaN(start.getTime())
    ? "Invalid Date"
    : formatToMonthYearHelper(start, lang);

  const formattedEnd = dates.current
    ? t(lang, "present")
    : end && !isNaN(end.getTime())
      ? formatToMonthYearHelper(end, lang)
      : "Invalid Date";

  return { formattedStart, formattedEnd };
};

export const checkContinentCodeHelper = async (contactInfo: any[]) => {
  const API_KEY = import.meta.env.PUBLIC_GEOLOCATION_API_KEY;
  if (!API_KEY) return null;

  const api = `https://api.ipgeolocation.io/ipgeo?apiKey=${API_KEY}`;

  try {
    const response = await fetch(api);
    const data = await response.json();
    const continent = data.continent_code;
    const amRegion = contactInfo.find((info) => info.region === "AM");

    let regionInfo;

    switch (continent) {
      case "AF":
        regionInfo = contactInfo.find((info) => info.region === "AF");
        break;
      case "AN":
        regionInfo =
          amRegion || contactInfo.find((info) => info.region === "AN");
        break;
      case "AS":
        regionInfo = contactInfo.find((info) => info.region === "AS");
        break;
      case "EU":
        regionInfo = contactInfo.find((info) => info.region === "EU");
        break;
      case "NA":
        regionInfo = contactInfo.find((info) => info.region === "NA");
        break;
      case "SA":
        regionInfo =
          amRegion || contactInfo.find((info) => info.region === "SA");
        break;
      case "OC":
        regionInfo = contactInfo.find((info) => info.region === "OC");
        break;
      default:
        regionInfo = contactInfo.find((info) => info.region === "row");
        break;
    }

    return regionInfo || null;
  } catch (error) {
    console.error("Error detecting location:", error);
    return contactInfo.find((info) => info.region === "row") || null;
  }
};
