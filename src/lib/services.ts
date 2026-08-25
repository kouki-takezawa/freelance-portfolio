import servicesData from "../../content/services.json";

export type ServiceMenu = {
  slug: string;
  name: string;
  priceFrom: string;
  duration: string;
  description: string;
  scope: string[];
};

export const services: ServiceMenu[] = servicesData;
