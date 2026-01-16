import type { me_user } from "./auth.types";

export const me_mock: me_user = {
  user_id: "u_demo_001",
  name: "Jaydon Frankie",
  email: "demo@minimals.cc",
  role: "user",

  phone: "(416) 555-0198",             
  address: "90210 Broadway Blvd",
  country_code: "ca",
  state_region: "California",
  city: "San Francisco",
  zip_code: "94116",
  about:
    "Praesent turpis. Phasellus viverra nulla ut metus varius laoreet. Phasellus tempus.",
  public_profile: true,

  avatar_url: "https://i.pravatar.cc/200?img=12", 
};
