import { defineField, defineType } from "sanity";

export const aboutMe = defineType({
  name: "aboutMe",
  type: "document",
  groups: [
    { name: "general", title: "General", default: true },
    { name: "ie", title: "Ingeniero Electrónico (IE)" },
    { name: "ds", title: "Desarrollador de Software (DS)" },
  ],
  fields: [
    defineField({
      name: "title",
      type: "string",
      group: "general",
      initialValue: "About Me",
      readOnly: true,
    }),
    defineField({
      name: "firstName",
      title: "First name",
      type: "string",
      group: "general",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "surname",
      type: "string",
      group: "general",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "jobTitle",
      title: "Job title",
      type: "string",
      group: "ie",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "jobTitleEs",
      title: "Job title (ES)",
      type: "string",
      group: "ie",
    }),
    defineField({
      name: "defaultContactInfo",
      title: "Default Contact Info",
      type: "object",
      group: "general",
      fields: [
        {
          name: "isActive",
          title: "Active Default Contact Info",
          type: "boolean",
          initialValue: true,
        },
        {
          name: "phone",
          type: "string",
        },
        {
          name: "city",
          type: "string",
        },
        {
          name: "cityEs",
          title: "City (ES)",
          type: "string",
        },
        {
          name: "country",
          type: "string",
        },
        {
          name: "countryEs",
          title: "Country (ES)",
          type: "string",
        },
      ],
    }),
    defineField({
      name: "dynamicContactInfo",
      type: "array",
      group: "general",
      hidden: ({ parent }) => parent?.defaultContactInfo?.isActive === true,
      of: [
        {
          type: "object",
          fields: [
            {
              name: "region",
              type: "string",
              options: {
                list: [
                  { title: "North America", value: "NA" },
                  { title: "South America", value: "SA" },
                  { title: "America", value: "AM" },
                  { title: "Europe", value: "EU" },
                  { title: "Asia", value: "AS" },
                  { title: "Africa", value: "AF" },
                  { title: "Oceania", value: "OC" },
                  { title: "Antarctica", value: "AN" },
                ],
              },
            },
            {
              name: "phone",
              type: "string",
            },
            {
              name: "city",
              type: "string",
            },
            {
              name: "cityEs",
              title: "City (ES)",
              type: "string",
            },
            {
              name: "country",
              type: "string",
            },
            {
              name: "countryEs",
              title: "Country (ES)",
              type: "string",
            },
          ],
        },
      ],
    }),
    defineField({
      name: "links",
      type: "array",
      group: "general",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "platformName",
              type: "string",
            },
            {
              name: "link",
              type: "url",
            },
          ],
        },
      ],
    }),
    defineField({
      name: "email",
      type: "email",
      group: "general",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "skills",
      type: "blockContent",
      group: "ie",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "skillsEs",
      title: "Skills (ES)",
      type: "blockContent",
      group: "ie",
    }),
    defineField({
      name: "languages",
      type: "blockContent",
      group: "general",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "languagesEs",
      title: "Languages (ES)",
      type: "blockContent",
      group: "general",
    }),
    defineField({
      name: "bio",
      type: "text",
      group: "ie",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "bioEs",
      title: "Bio (ES)",
      type: "text",
      group: "ie",
    }),
    defineField({
      name: "jobTitleDs",
      title: "Job title (DS profile)",
      type: "string",
      group: "ds",
      description:
        "Se usa en /resume/{es,en}/ds. Si está vacío, se usa el valor de IE.",
    }),
    defineField({
      name: "jobTitleDsEs",
      title: "Job title (DS profile, ES)",
      type: "string",
      group: "ds",
      description:
        "Se usa en /resume/{es,en}/ds. Si está vacío, se usa el valor de IE.",
    }),
    defineField({
      name: "bioDs",
      title: "Bio (DS profile)",
      type: "text",
      group: "ds",
      description:
        "Se usa en /resume/{es,en}/ds. Si está vacío, se usa el valor de IE.",
    }),
    defineField({
      name: "bioDsEs",
      title: "Bio (DS profile, ES)",
      type: "text",
      group: "ds",
      description:
        "Se usa en /resume/{es,en}/ds. Si está vacío, se usa el valor de IE.",
    }),
    defineField({
      name: "skillsDs",
      title: "Skills (DS profile)",
      type: "blockContent",
      group: "ds",
      description:
        "Se usa en /resume/{es,en}/ds. Si está vacío, se usa el valor de IE.",
    }),
    defineField({
      name: "skillsDsEs",
      title: "Skills (DS profile, ES)",
      type: "blockContent",
      group: "ds",
      description:
        "Se usa en /resume/{es,en}/ds. Si está vacío, se usa el valor de IE.",
    }),
  ],
});
