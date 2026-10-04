import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Client {
  id: number;
  nom: string;
  prenom: string;
}

interface Devis {
  id: number;
  numero_devis: string;
  client_id: number;
  produit: string;
  montant: number;
  statut: string;
  date_creation: string;
  date_expiration?: string;
}

interface Contrat {
  id: number;
  numero_contrat: string;
  devis_id: number;
  client_id: number;
  produit: string;
  montant: number;
  statut: string;
  date_debut: string;
  date_fin?: string;
  date_creation: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  clientCount = signal(0);
  devisEnAttenteCount = signal(0);
  contratsActifsCount = signal(0);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadClientCount();
    this.loadDevisCount();
    this.loadContratsCount();
  }

  loadClientCount(): void {
    this.http
      .get<Client[]>('http://127.0.0.1:8000/clients')
      .subscribe({
        next: (clients) => {
          this.clientCount.set(clients.length);
        },
        error: (err) => {
          console.error(
            'Erreur lors du chargement des clients :',
            err
          );
        }
      });
  }

  loadDevisCount(): void {
    this.http
      .get<Devis[]>('http://127.0.0.1:8000/devis')
      .subscribe({
        next: (devis) => {
          const enAttente = devis.filter(
            d => d.statut === 'EN_ATTENTE'
          );

          this.devisEnAttenteCount.set(enAttente.length);
        },
        error: (err) => {
          console.error(
            'Erreur lors du chargement des devis :',
            err
          );
        }
      });
  }

  loadContratsCount(): void {
    this.http
      .get<Contrat[]>('http://127.0.0.1:8000/contrats')
      .subscribe({
        next: (contrats) => {
          const actifs = contrats.filter(
            contrat => contrat.statut === 'ACTIF'
          );

          this.contratsActifsCount.set(actifs.length);
        },
        error: (err) => {
          console.error(
            'Erreur lors du chargement des contrats :',
            err
          );
        }
      });
  }
}