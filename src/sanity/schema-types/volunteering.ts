import { defineField, defineType } from "sanity";

export const volunteering = defineType({
  name: "volunteering",
  title: "Volunteering",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
    }),
    defineField({
      name: "role",
      title: "Role",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "roleEs",
      title: "Role (ES)",
      type: "string",
    }),
    defineField({
      name: "startDate",
      title: "Start Date",
      type: "date",
      validation: (rule) => rule.required(),
      options: {
        dateFormat: "MMM-YYYY",
      },
    }),
    defineField({
      name: "endDate",
      title: "End Date",
      type: "date",
      options: {
        dateFormat: "MMM-YYYY",
      },
      hidden: ({ document }) => document?.current === true,
    }),
    defineField({
      name: "current",
      title: "Current",
      type: "boolean",
    }),
    defineField({
      name: "organization",
      title: "Organization",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      of: [
        {
          title: "Block",
          type: "block",
          styles: [{ title: "Normal", value: "normal" }],
          lists: [
            { title: "Bullet", value: "bullet" },
            { title: "Numbered", value: "number" },
          ],
        },
      ],
    }),
    defineField({
      name: "descriptionEs",
      title: "Description (ES)",
      type: "array",
      of: [
        {
          title: "Block",
          type: "block",
          styles: [{ title: "Normal", value: "normal" }],
          lists: [
            { title: "Bullet", value: "bullet" },
            { title: "Numbered", value: "number" },
          ],
        },
      ],
    }),
    defineField({
      name: "chronoIndex",
      title: "Chronological work experience",
      type: "number",
      options: {
        list: [
          { title: "1", value: 1 },
          { title: "2", value: 2 },
          { title: "3", value: 3 },
          { title: "4", value: 4 },
          { title: "5", value: 5 },
        ],
      },
      validation: (rule) => rule.required(),
    }),
  ],
});
