// Free downloads and publisher pages for individual publications (by BibTeX key).
// Shown as a "Letöltés / Download" link under the reference, on the home page and
// on the publications page; book covers on the home page link here too.
const pszichStat = "https://dupress.unideb.hu/hu/termek/pszichologiai-statisztika-alapismeretek-jamovi-es-r-peldakkal/";

export const downloadLinks: Record<string, string> = {
  abari2025adatkezeles: "https://dupress.unideb.hu/hu/termek/adatkezeles-es-egyvaltozos-elemzesek-r-ben/",
  // The edited volume and its chapters.
  abari2025pszichologiai: pszichStat,
  abari2025informatikai: pszichStat,
  abari2025adatelokeszites: pszichStat,
  math2025kozepertekek: pszichStat,
  abari2025reprodukalhato: pszichStat,
};
