import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Client {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
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

@Component({
  selector: 'app-devis',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './devis.html',
  styleUrl: './devis.css'
})
export class DevisPage implements OnInit {

  devis = signal<Devis[]>([]);
  clients = signal<Client[]>([]);

  loading = signal(true);
  error = signal('');

  showDevisForm = false;
  savingDevis = false;

  newDevis = {
    client_id: 0,
    produit: '',
    montant: 0,
    date_expiration: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDevis();
    this.loadClients();
  }

  loadDevis(): void {
    this.loading.set(true);

    this.http
      .get<Devis[]>('http://127.0.0.1:8000/devis')
      .subscribe({
        next: (data) => {
          this.devis.set(data);
          this.loading.set(false);
        },

        error: (err) => {
          console.error('Erreur chargement devis :', err);
          this.error.set('Impossible de charger les devis.');
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

  openDevisForm(): void {
    this.resetDevisForm();
    this.showDevisForm = true;
  }

  closeDevisForm(): void {
    this.showDevisForm = false;
    this.resetDevisForm();
  }

  createDevis(): void {

    if (
      !this.newDevis.client_id ||
      !this.newDevis.produit.trim() ||
      this.newDevis.montant <= 0
    ) {
      alert('Client, produit et montant sont obligatoires.');
      return;
    }

    this.savingDevis = true;

    const payload = {
      client_id: Number(this.newDevis.client_id),
      produit: this.newDevis.produit,
      montant: Number(this.newDevis.montant),
      date_expiration:
        this.newDevis.date_expiration || null
    };

    this.http
      .post<Devis>(
        'http://127.0.0.1:8000/devis',
        payload
      )
      .subscribe({
        next: (createdDevis) => {

          this.devis.update(list => [
            createdDevis,
            ...list
          ]);

          this.closeDevisForm();
          this.savingDevis = false;
        },

        error: (err) => {
          console.error('Erreur création devis :', err);

          alert("Impossible de créer le devis.");

          this.savingDevis = false;
        }
      });
  }

  getClientName(clientId: number): string {

    const client = this.clients().find(
      client => client.id === clientId
    );

    if (!client) {
      return `Client #${clientId}`;
    }

    return `${client.prenom} ${client.nom}`;
  }

  resetDevisForm(): void {
    this.newDevis = {
      client_id: 0,
      produit: '',
      montant: 0,
      date_expiration: ''
    };
  }
}