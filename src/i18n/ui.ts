export type Lang = "en" | "es";

export const ui = {
  en: {
    contactInfo: "Contact Info",
    socialLinks: "Social Links",
    skills: "Skills",
    languages: "Languages",
    professionalProfile: "Professional Profile",
    coreTech: "Core Technologies",
    workExperience: "Work Experience",
    volunteering: "Volunteering",
    education: "Education",
    present: "Present",
  },
  es: {
    contactInfo: "Información de Contacto",
    socialLinks: "Redes Sociales",
    skills: "Habilidades",
    languages: "Idiomas",
    professionalProfile: "Perfil Profesional",
    coreTech: "Tecnologías Principales",
    workExperience: "Experiencia Laboral",
    volunteering: "Voluntariado",
    education: "Educación",
    present: "Presente",
  },
} as const satisfies Record<Lang, Record<string, string>>;

export const modalityMap = {
  en: {
    "on-site": "on-site",
    hybrid: "hybrid",
    remote: "remote",
  },
  es: {
    "on-site": "presencial",
    hybrid: "híbrido",
    remote: "remoto",
  },
} as const satisfies Record<Lang, Record<string, string>>;

export const monthsMap = {
  en: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  es: [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ],
} as const satisfies Record<Lang, string[]>;

export const t = (lang: Lang, key: keyof (typeof ui)["en"]) => ui[lang][key];

export const getModality = (lang: Lang, modality: string) =>
  modalityMap[lang]?.[modality as keyof (typeof modalityMap)["en"]] ??
  modality;
