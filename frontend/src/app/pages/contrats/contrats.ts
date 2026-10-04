import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface Client {
  id: number;
  nom: string;
  prenom: string;
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
  selector: 'app-contrats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contrats.html',
  styleUrl: './contrats.css'
})
export class ContratsPage implements OnInit {

  contrats = signal<Contrat[]>([]);
  clients = signal<Client[]>([]);

  loading = signal(true);
  error = signal('');

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadClients();
    this.loadContrats();
  }

  loadContrats(): void {
    this.loading.set(true);

    this.http
      .get<Contrat[]>('http://127.0.0.1:8000/contrats')
      .subscribe({
        next: (data) => {
          this.contrats.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Erreur chargement contrats :', err);
          this.error.set('Impossible de charger les contrats.');
          this.loading.set(false);
        }
      });
  }

  loadClients(): void {
    this.http
      .get<Client[]>('http://127.0.0.1:8000/clients')
      .subscribe({
        next: (data) => {
          this.clients.set(data);
        },
        error: (err) => {
          console.error('Erreur chargement clients :', err);
        }
      });
  }

  getClientName(clientId: number): string {
    const client = this.clients().find(
      item => item.id === clientId
    );

    if (!client) {
      return `Client #${clientId}`;
    }

    return `${client.prenom} ${client.nom}`;
  }
}