import type { SchemaTypeDefinition } from "sanity";
import { blockContentType } from "./block-content-type";
import { aboutMe } from "./about-me";
import { workExperience } from "./work-experience";
import { education } from "./education";
import { volunteering } from "./volunteering";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [blockContentType, aboutMe, education, volunteering, workExperience],
};
