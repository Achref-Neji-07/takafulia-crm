import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Client {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email?: string;
  adresse?: string;
  cin?: string;
  actif: boolean;
  date_creation: string;
}

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clients.html',
  styleUrl: './clients.css'
})
export class Clients implements OnInit {

  clients = signal<Client[]>([]);
  loading = signal(true);
  error = signal('');

  showClientForm = false;
  savingClient = false;

  editingClient: Client | null = null;

  newClient = {
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    adresse: '',
    cin: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.loading.set(true);
    this.error.set('');

    this.http
      .get<Client[]>('http://127.0.0.1:8000/clients')
      .subscribe({
        next: (data) => {
          this.clients.set(data);
          this.loading.set(false);
        },

        error: (err) => {
          console.error('Erreur API :', err);
          this.error.set('Impossible de contacter le backend.');
          this.loading.set(false);
        }
      });
  }

  openClientForm(): void {
    this.editingClient = null;
    this.resetClientForm();
    this.showClientForm = true;
  }

  closeClientForm(): void {
    this.showClientForm = false;
    this.editingClient = null;
    this.resetClientForm();
  }

  editClient(client: Client): void {
    this.editingClient = client;

    this.newClient = {
      nom: client.nom,
      prenom: client.prenom,
      telephone: client.telephone,
      email: client.email || '',
      adresse: client.adresse || '',
      cin: client.cin || ''
    };

    this.showClientForm = true;
  }

  saveClient(): void {
    if (
      !this.newClient.nom.trim() ||
      !this.newClient.prenom.trim() ||
      !this.newClient.telephone.trim()
    ) {
      alert('Nom, prénom et téléphone sont obligatoires.');
      return;
    }

    if (this.editingClient) {
      this.updateClient();
    } else {
      this.addClient();
    }
  }

  addClient(): void {
    this.savingClient = true;

    this.http
      .post<Client>(
        'http://127.0.0.1:8000/clients',
        this.newClient
      )
      .subscribe({
        next: (client) => {
          this.clients.update(clients => [
            client,
            ...clients
          ]);

          this.closeClientForm();
          this.savingClient = false;
        },

        error: (err) => {
          console.error('Erreur création client :', err);
          alert("Impossible d'ajouter le client.");
          this.savingClient = false;
        }
      });
  }

  updateClient(): void {
    if (!this.editingClient) {
      return;
    }

    this.savingClient = true;

    const id = this.editingClient.id;

    this.http
      .put<Client>(
        `http://127.0.0.1:8000/clients/${id}`,
        this.newClient
      )
      .subscribe({
        next: (updatedClient) => {
          this.clients.update(clients =>
            clients.map(client =>
              client.id === id ? updatedClient : client
            )
          );

          this.closeClientForm();
          this.savingClient = false;
        },

        error: (err) => {
          console.error('Erreur modification :', err);
          alert('Impossible de modifier le client.');
          this.savingClient = false;
        }
      });
  }

  deleteClient(client: Client): void {
    const confirmation = confirm(
      `Voulez-vous vraiment supprimer ${client.prenom} ${client.nom} ?`
    );

    if (!confirmation) {
      return;
    }

    this.http
      .delete(
        `http://127.0.0.1:8000/clients/${client.id}`
      )
      .subscribe({
        next: () => {
          this.clients.update(clients =>
            clients.filter(c => c.id !== client.id)
          );
        },

        error: (err) => {
          console.error('Erreur suppression :', err);
          alert('Impossible de supprimer le client.');
        }
      });
  }

  resetClientForm(): void {
    this.newClient = {
      nom: '',
      prenom: '',
      telephone: '',
      email: '',
      adresse: '',
      cin: ''
    };
  }
}