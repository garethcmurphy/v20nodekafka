#!/usr/bin/env ts-node
export class GetOrcid {
  orcids = {
    "Anton Khaplanov": "https://orcid.org/0000-0001-6195-5538",
    "Dorothea Pfeiffer": "https://orcid.org/0000-0003-3893-2308",
    "Francesco Piscitelli": "https://orcid.org/0000-0002-0325-4407",
    "Heloisa Bordallo": "https://orcid.org/0000-0003-0750-0553",
    "Kalliope Kanaki": "https://orcid.org/0000-0001-5122-3595",
    "Malcolm Guthrie": "https://orcid.org/0000-0002-9888-7468",
    "Manuel Morgano": "https://orcid.org/0000-0001-6195-5538",
    "Markus Strobl": "https://orcid.org/0000-0001-9315-8787",
    "Robin Woracek": "https://orcid.org/0000-0002-3526-8192",
    "Tobias Richter": "https://orcid.org/0000-0002-7774-8995",
    "Werner Scheika": "https://orcid.org/0000-0003-2804-9407"
  };
  get(name: string) {
    if (name in this.orcids) {
      return this.orcids[name];
    } else {
      return "default";
    }
  }
}

if (require.main === module) {
  const orc = new GetOrcid();
  const out = orc.get("Robin Woracek");
  console.log(orc.get("Tobias Richter"));
  console.log(orc.get("unknown"));
}
