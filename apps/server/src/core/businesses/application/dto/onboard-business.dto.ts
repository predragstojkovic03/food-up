export interface OnboardBusinessDto {
  name: string;
  contactEmail: string;
  contactPhone?: string;
  manager: {
    name: string;
    email: string;
    password: string;
  };
}
