import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Country {
  name: {
    common: string;
    official: string;
  };
  capital: string;
  flags: {
    png: string;
    svg: string;
    alt: string;
  };
  languages: string[];
  currencies: { name: string }[];
  population: number;
  region: string;
  subregion: string;
  borders: string[];
  latlng: number[];
  maps?: {
    googleMaps?: string;
    openStreetMaps?: string;
  };
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  title = 'prueba1';
  countries: Country[] = [];
  filteredCountries: Country[] = [];
  displayedCountries: Country[] = [];
  selectedCountry: Country | null = null;
  modalOpen: boolean = false;
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchCountries();
  }

  fetchCountries() {
    console.log('fetchCountries()');
    this.http.get<Country[]>("https://restcountries.com/v3.1/all").subscribe(data => {
      console.log('Datos recibidos:', data);
      this.countries = data.map(country => ({
        name: { common: country.name.common, official: country.name.official },
        capital: country.capital ? country.capital : '',
        flags: country.flags ? country.flags : { png: '', svg: '', alt: '' },
        languages: country.languages ? Object.values(country.languages) : [],
        currencies: country.currencies ? Object.values(country.currencies).map((curr: any) => ({ name: curr.name })) : [],
        population: country.population,
        region: country.region,
        subregion: country.subregion,
        borders: country.borders,
        latlng: country.latlng,
        maps: {
          googleMaps: country.maps?.googleMaps || '',
          openStreetMaps: country.maps?.openStreetMaps || ''
        }
      }));

      this.applyFilter();
    });
  }

  getCurrencyNames(currencies: { name: string }[]): string {
    return currencies.map(curr => curr.name).join(', ');
  }

  applyFilter() {
    const searchTermLower = this.searchTerm.toLowerCase().trim();

    this.filteredCountries = this.countries.filter(country => {
      const commonNameLower = country.name.common.toLowerCase();
      const capitalLower = Array.isArray(country.capital) ? country.capital[0].toLowerCase() : (country.capital || '').toLowerCase();
      return commonNameLower.includes(searchTermLower) || capitalLower.includes(searchTermLower);
    });

    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedCountries = this.filteredCountries.slice(startIndex, endIndex);
  }

  setPage(page: number) {
    if (page < 1 || page > this.totalPages()) {
      return;
    }
    this.currentPage = page;
    this.updatePagination();

    console.log('Página actual:', this.currentPage);
    console.log('Datos paginados:', this.displayedCountries);
  }

  openModal(country: Country) {
    this.selectedCountry = country;
    this.modalOpen = true;
  }

  closeModal() {
    this.modalOpen = false;
    this.selectedCountry = null;
  }

  totalPages(): number {
    return Math.ceil(this.filteredCountries.length / this.itemsPerPage);
  }

  totalPagesArray(): number[] {
    const totalPages = this.totalPages();
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
}
