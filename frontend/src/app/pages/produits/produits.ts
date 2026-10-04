import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Produit {
  id: number;
  nom: string;
  description?: string | null;
  actif: boolean;
  date_creation: string;
}

@Component({
  selector: 'app-produits',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './produits.html',
  styleUrl: './produits.css'
})
export class ProduitsPage implements OnInit {

  private readonly apiUrl = 'http://127.0.0.1:8000/produits';

  produits = signal<Produit[]>([]);
  loading = signal(true);
  error = signal('');

  showProduitForm = false;
  savingProduit = false;

  editingProduit: Produit | null = null;

  newProduit = {
    nom: '',
    description: '',
    actif: true
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadProduits();
  }

  // =========================
  // CHARGER LES PRODUITS
  // =========================
  loadProduits(): void {
    this.loading.set(true);
    this.error.set('');

    this.http
      .get<Produit[]>(this.apiUrl)
      .subscribe({
        next: (data) => {
          this.produits.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Erreur chargement produits :', err);
          this.error.set('Impossible de charger les produits.');
          this.loading.set(false);
        }
      });
  }

  // =========================
  // OUVRIR FORMULAIRE CRÉATION
  // =========================
  openProduitForm(): void {
    this.editingProduit = null;
    this.resetProduitForm();
    this.showProduitForm = true;
  }

  // =========================
  // FERMER FORMULAIRE
  // =========================
  closeProduitForm(): void {
    this.showProduitForm = false;
    this.editingProduit = null;
    this.resetProduitForm();
  }

  // =========================
  // CRÉER PRODUIT
  // =========================
  createProduit(): void {

    if (!this.newProduit.nom.trim()) {
      alert('Le nom du produit est obligatoire.');
      return;
    }

    this.savingProduit = true;

    const payload = {
      nom: this.newProduit.nom.trim(),
      description:
        this.newProduit.description.trim() || null,
      actif: this.newProduit.actif
    };

    this.http
      .post<Produit>(this.apiUrl, payload)
      .subscribe({
        next: (createdProduit) => {

          this.produits.update(list => [
            createdProduit,
            ...list
          ]);

          this.savingProduit = false;
          this.closeProduitForm();
        },

        error: (err) => {
          console.error('Erreur création produit :', err);
          alert('Impossible de créer le produit.');
          this.savingProduit = false;
        }
      });
  }

  // =========================
  // OUVRIR MODIFICATION
  // =========================
  editProduit(produit: Produit): void {

    this.editingProduit = produit;

    this.newProduit = {
      nom: produit.nom,
      description: produit.description || '',
      actif: produit.actif
    };

    this.showProduitForm = true;
  }

  // =========================
  // MODIFIER PRODUIT
  // =========================
  updateProduit(): void {

    if (!this.editingProduit) {
      return;
    }

    if (!this.newProduit.nom.trim()) {
      alert('Le nom du produit est obligatoire.');
      return;
    }

    this.savingProduit = true;

    const payload = {
      nom: this.newProduit.nom.trim(),
      description:
        this.newProduit.description.trim() || null,
      actif: this.newProduit.actif
    };

    this.http
      .put<Produit>(
        `${this.apiUrl}/${this.editingProduit.id}`,
        payload
      )
      .subscribe({
        next: (updatedProduit) => {

          this.produits.update(list =>
            list.map(produit =>
              produit.id === updatedProduit.id
                ? updatedProduit
                : produit
            )
          );

          this.savingProduit = false;
          this.closeProduitForm();
        },

        error: (err) => {
          console.error('Erreur modification produit :', err);
          alert('Impossible de modifier le produit.');
          this.savingProduit = false;
        }
      });
  }

  // =========================
  // ACTIVER / DÉSACTIVER
  // =========================
  toggleProduit(produit: Produit): void {

    const payload = {
      actif: !produit.actif
    };

    this.http
      .put<Produit>(
        `${this.apiUrl}/${produit.id}`,
        payload
      )
      .subscribe({
        next: (updatedProduit) => {

          this.produits.update(list =>
            list.map(item =>
              item.id === updatedProduit.id
                ? updatedProduit
                : item
            )
          );
        },

        error: (err) => {
          console.error(
            'Erreur changement statut produit :',
            err
          );

          alert(
            'Impossible de modifier le statut du produit.'
          );
        }
      });
  }

  // =========================
  // SUPPRIMER PRODUIT
  // =========================
  deleteProduit(produit: Produit): void {

    const confirmation = confirm(
      `Voulez-vous vraiment supprimer "${produit.nom}" ?`
    );

    if (!confirmation) {
      return;
    }

    this.http
      .delete(`${this.apiUrl}/${produit.id}`)
      .subscribe({
        next: () => {

          this.produits.update(list =>
            list.filter(item => item.id !== produit.id)
          );
        },

        error: (err) => {
          console.error('Erreur suppression produit :', err);
          alert('Impossible de supprimer le produit.');
        }
      });
  }

  // =========================
  // CRÉER OU MODIFIER
  // =========================
  saveProduit(): void {

    if (this.editingProduit) {
      this.updateProduit();
    } else {
      this.createProduit();
    }
  }

  // =========================
  // RESET FORMULAIRE
  // =========================
  resetProduitForm(): void {
    this.newProduit = {
      nom: '',
      description: '',
      actif: true
    };
  }
}