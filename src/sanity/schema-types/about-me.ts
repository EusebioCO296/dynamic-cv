import { defineField, defineType } from "sanity";

export const aboutMe = defineType({
  name: "aboutMe",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      initialValue: "About Me",
      readOnly: true,
    }),
    defineField({
      name: "firstName",
      title: "First name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "surname",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "jobTitle",
      title: "Job title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "jobTitleEs",
      title: "Job title (ES)",
      type: "string",
    }),
    defineField({
      name: "defaultContactInfo",
      title: "Default Contact Info",
      type: "object",
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
          name: "country",
          type: "string",
        },
      ],
    }),
    defineField({
      name: "dynamicContactInfo",
      type: "array",
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
              name: "country",
              type: "string",
            },
          ],
        },
      ],
    }),
    defineField({
      name: "links",
      type: "array",
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
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "skills",
      type: "blockContent",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "skillsEs",
      title: "Skills (ES)",
      type: "blockContent",
    }),
    defineField({
      name: "languages",
      type: "blockContent",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "languagesEs",
      title: "Languages (ES)",
      type: "blockContent",
    }),
    defineField({
      name: "bio",
      type: "text",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "bioEs",
      title: "Bio (ES)",
      type: "text",
    }),
    defineField({
      name: "coreTech",
      title: "Core Technologies",
      type: "blockContent",
    }),
    defineField({
      name: "coreTechEs",
      title: "Core Technologies (ES)",
      type: "blockContent",
    }),
  ],
});
