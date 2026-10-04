import {
  ChangeDetectorRef,
  Component,
  OnInit,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';


interface Client {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
}


interface Produit {
  id: number;
  nom: string;
  description?: string;
  actif: boolean;
  date_creation: string;
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


interface DevisAuto {
  id: number;
  devis_id: number;
  immatriculation: string;
  marque: string;
  modele: string;
  annee: number | null;
  puissance_fiscale: number | null;
  valeur_vehicule: number | null;
  date_premiere_mise_circulation: string | null;
  usage_vehicule: string | null;
  date_creation: string;
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

  // =========================
  // DONNÉES
  // =========================

  devis = signal<Devis[]>([]);
  clients = signal<Client[]>([]);
  produits = signal<Produit[]>([]);


  // =========================
  // ÉTAT
  // =========================

  loading = signal(true);
  error = signal('');

  showDevisForm = false;
  savingDevis = false;

  editingDevis: Devis | null = null;


  // =========================
  // DÉTAILS AUTO
  // =========================

  selectedDevisAuto: DevisAuto | null = null;
  showAutoDetails = false;
  loadingAutoDetails = false;


  // =========================
  // FORMULAIRE DEVIS
  // =========================

  newDevis = {
    client_id: 0,
    produit: '',
    montant: 0,
    date_expiration: ''
  };


  // =========================
  // FORMULAIRE AUTO
  // =========================

  newDevisAuto = {
    immatriculation: '',
    marque: '',
    modele: '',
    annee: null as number | null,
    puissance_fiscale: null as number | null,
    valeur_vehicule: null as number | null,
    date_premiere_mise_circulation: '',
    usage_vehicule: ''
  };


  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}


  // =========================
  // INITIALISATION
  // =========================

  ngOnInit(): void {
    this.loadDevis();
    this.loadClients();
    this.loadProduits();
  }


  // =========================
  // CHARGEMENT DEVIS
  // =========================

  loadDevis(): void {

    this.loading.set(true);
    this.error.set('');

    this.http
      .get<Devis[]>(
        'http://127.0.0.1:8000/devis'
      )
      .subscribe({

        next: (data) => {

          this.devis.set(data);

          this.loading.set(false);
        },

        error: (err) => {

          console.error(
            'Erreur chargement devis :',
            err
          );

          this.error.set(
            'Impossible de charger les devis.'
          );

          this.loading.set(false);
        }

      });
  }


  // =========================
  // ASSURANCE AUTO ?
  // =========================

  isAssuranceAuto(): boolean {

    return (
      this.newDevis.produit ===
      'Assurance Auto'
    );
  }


  // =========================
  // CHARGEMENT CLIENTS
  // =========================

  loadClients(): void {

    this.http
      .get<Client[]>(
        'http://127.0.0.1:8000/clients'
      )
      .subscribe({

        next: (data) => {

          this.clients.set(data);
        },

        error: (err) => {

          console.error(
            'Erreur chargement clients :',
            err
          );
        }

      });
  }


  // =========================
  // CHARGEMENT PRODUITS
  // =========================

  loadProduits(): void {

    this.http
      .get<Produit[]>(
        'http://127.0.0.1:8000/produits'
      )
      .subscribe({

        next: (data) => {

          const produitsActifs =
            data.filter(
              produit => produit.actif
            );

          this.produits.set(
            produitsActifs
          );
        },

        error: (err) => {

          console.error(
            'Erreur chargement produits :',
            err
          );
        }

      });
  }


  // =========================
  // OUVRIR FORMULAIRE
  // =========================

  openDevisForm(): void {

    this.editingDevis = null;

    this.resetDevisForm();

    this.showDevisForm = true;

    this.cdr.detectChanges();
  }


  // =========================
  // FERMER FORMULAIRE
  // =========================

  closeDevisForm(): void {

    this.showDevisForm = false;

    this.editingDevis = null;

    this.resetDevisForm();

    this.cdr.detectChanges();
  }


  // =========================
  // CRÉER DEVIS
  // =========================

  createDevis(): void {

    if (
      !this.newDevis.client_id ||
      !this.newDevis.produit.trim() ||
      this.newDevis.montant <= 0
    ) {

      alert(
        'Client, produit et montant sont obligatoires.'
      );

      return;
    }


    // Validation Auto

    if (this.isAssuranceAuto()) {

      if (
        !this.newDevisAuto.immatriculation.trim() ||
        !this.newDevisAuto.marque.trim() ||
        !this.newDevisAuto.modele.trim()
      ) {

        alert(
          'Immatriculation, marque et modèle sont obligatoires pour une assurance Auto.'
        );

        return;
      }
    }


    this.savingDevis = true;


    const payload = {

      client_id:
        Number(
          this.newDevis.client_id
        ),

      produit:
        this.newDevis.produit,

      montant:
        Number(
          this.newDevis.montant
        ),

      date_expiration:
        this.newDevis.date_expiration
        || null
    };


    // =========================
    // CRÉER DEVIS PRINCIPAL
    // =========================

    this.http
      .post<Devis>(
        'http://127.0.0.1:8000/devis',
        payload
      )
      .subscribe({

        next: (createdDevis) => {


          // =========================
          // PRODUIT NON AUTO
          // =========================

          if (!this.isAssuranceAuto()) {

            this.devis.update(
              list => [
                createdDevis,
                ...list
              ]
            );

            this.savingDevis = false;

            this.closeDevisForm();

            return;
          }


          // =========================
          // PAYLOAD AUTO
          // =========================

          const autoPayload = {

            devis_id:
              createdDevis.id,

            immatriculation:
              this.newDevisAuto
                .immatriculation
                .trim(),

            marque:
              this.newDevisAuto
                .marque
                .trim(),

            modele:
              this.newDevisAuto
                .modele
                .trim(),

            annee:
              this.newDevisAuto.annee,

            puissance_fiscale:
              this.newDevisAuto
                .puissance_fiscale,

            valeur_vehicule:
              this.newDevisAuto
                .valeur_vehicule,

            date_premiere_mise_circulation:
              this.newDevisAuto
                .date_premiere_mise_circulation
              || null,

            usage_vehicule:
              this.newDevisAuto
                .usage_vehicule
              || null
          };


          // =========================
          // CRÉER DÉTAILS AUTO
          // =========================

          this.http
            .post(
              'http://127.0.0.1:8000/devis-auto',
              autoPayload
            )
            .subscribe({

              next: () => {

                this.devis.update(
                  list => [
                    createdDevis,
                    ...list
                  ]
                );

                this.savingDevis = false;

                this.closeDevisForm();

                alert(
                  'Devis Auto créé avec succès.'
                );
              },

              error: (err) => {

                console.error(
                  'Erreur création informations Auto :',
                  err
                );

                this.devis.update(
                  list => [
                    createdDevis,
                    ...list
                  ]
                );

                this.savingDevis = false;

                this.cdr.detectChanges();

                alert(
                  'Le devis a été créé, mais les informations du véhicule n’ont pas pu être enregistrées.'
                );
              }

            });

        },

        error: (err) => {

          console.error(
            'Erreur création devis :',
            err
          );

          this.savingDevis = false;

          this.cdr.detectChanges();

          alert(
            'Impossible de créer le devis.'
          );
        }

      });
  }


  // =========================
  // OUVRIR MODIFICATION
  // =========================

  editDevis(
    devis: Devis
  ): void {

    this.editingDevis = devis;

    this.newDevis = {

      client_id:
        devis.client_id,

      produit:
        devis.produit,

      montant:
        devis.montant,

      date_expiration:
        devis.date_expiration
          ? devis.date_expiration.slice(
              0,
              16
            )
          : ''
    };

    this.showDevisForm = true;

    this.cdr.detectChanges();
  }


  // =========================
  // MODIFIER DEVIS
  // =========================

  updateDevis(): void {

    if (!this.editingDevis) {
      return;
    }


    if (
      !this.newDevis.client_id ||
      !this.newDevis.produit.trim() ||
      this.newDevis.montant <= 0
    ) {

      alert(
        'Client, produit et montant sont obligatoires.'
      );

      return;
    }


    this.savingDevis = true;


    const payload = {

      client_id:
        Number(
          this.newDevis.client_id
        ),

      produit:
        this.newDevis.produit,

      montant:
        Number(
          this.newDevis.montant
        ),

      date_expiration:
        this.newDevis.date_expiration
        || null
    };


    this.http
      .put<Devis>(
        `http://127.0.0.1:8000/devis/${this.editingDevis.id}`,
        payload
      )
      .subscribe({

        next: (updatedDevis) => {

          this.devis.update(
            list =>
              list.map(
                item =>
                  item.id ===
                  updatedDevis.id
                    ? updatedDevis
                    : item
              )
          );

          this.savingDevis = false;

          this.closeDevisForm();
        },

        error: (err) => {

          console.error(
            'Erreur modification devis :',
            err
          );

          this.savingDevis = false;

          this.cdr.detectChanges();

          alert(
            'Impossible de modifier le devis.'
          );
        }

      });
  }


  // =========================
  // SAUVEGARDE
  // =========================

  saveDevis(): void {

    if (this.editingDevis) {

      this.updateDevis();

    } else {

      this.createDevis();
    }
  }


  // =========================
  // SUPPRIMER DEVIS
  // =========================

  deleteDevis(
    devis: Devis
  ): void {

    const confirmation =
      confirm(
        `Voulez-vous vraiment supprimer le devis ${devis.numero_devis} ?`
      );


    if (!confirmation) {
      return;
    }


    this.http
      .delete(
        `http://127.0.0.1:8000/devis/${devis.id}`
      )
      .subscribe({

        next: () => {

          this.devis.update(
            list =>
              list.filter(
                item =>
                  item.id !==
                  devis.id
              )
          );

          this.cdr.detectChanges();
        },

        error: (err) => {

          console.error(
            'Erreur suppression devis :',
            err
          );

          alert(
            'Impossible de supprimer le devis.'
          );
        }

      });
  }


  // =========================
  // CHANGEMENT STATUT
  // =========================

  changeStatut(
    devis: Devis,
    nouveauStatut:
      'ACCEPTE' |
      'REFUSE'
  ): void {

    this.http
      .put<Devis>(
        `http://127.0.0.1:8000/devis/${devis.id}`,
        {
          statut:
            nouveauStatut
        }
      )
      .subscribe({

        next: (updatedDevis) => {

          this.devis.update(
            list =>
              list.map(
                item =>
                  item.id ===
                  updatedDevis.id
                    ? updatedDevis
                    : item
              )
          );

          this.cdr.detectChanges();
        },

        error: (err) => {

          console.error(
            'Erreur changement statut :',
            err
          );

          alert(
            'Impossible de modifier le statut du devis.'
          );
        }

      });
  }


  // =========================
  // VOIR DÉTAILS AUTO
  // =========================

  voirDetailsAuto(
    devis: Devis
  ): void {

    console.log(
      'Devis sélectionné :',
      devis
    );

    this.loadingAutoDetails = true;


    this.http
      .get<DevisAuto[]>(
        'http://127.0.0.1:8000/devis-auto'
      )
      .subscribe({

        next: (data) => {

          console.log(
            'Données /devis-auto :',
            data
          );


          const details =
            data.find(
              auto =>
                Number(
                  auto.devis_id
                ) ===
                Number(
                  devis.id
                )
            );


          console.log(
            'Détails Auto trouvés :',
            details
          );


          if (!details) {

            this.loadingAutoDetails =
              false;

            this.cdr.detectChanges();

            alert(
              `Aucune information véhicule trouvée pour le devis ${devis.numero_devis}.`
            );

            return;
          }


          this.selectedDevisAuto =
            details;

          this.showAutoDetails =
            true;

          this.loadingAutoDetails =
            false;


          // IMPORTANT :
          // forcer Angular à mettre à jour
          // immédiatement le template

          this.cdr.detectChanges();

        },

        error: (err) => {

          console.error(
            'Erreur API /devis-auto :',
            err
          );

          this.loadingAutoDetails =
            false;

          this.cdr.detectChanges();

          alert(
            'Impossible de charger les informations du véhicule.'
          );

        }

      });
  }


  // =========================
  // FERMER DÉTAILS AUTO
  // =========================

  closeAutoDetails(): void {

    this.showAutoDetails =
      false;

    this.selectedDevisAuto =
      null;

    this.cdr.detectChanges();
  }


  // =========================
  // NOM CLIENT
  // =========================

  getClientName(
    clientId: number
  ): string {

    const client =
      this.clients().find(
        client =>
          client.id ===
          clientId
      );


    if (!client) {

      return `Client #${clientId}`;
    }


    return (
      `${client.prenom} ${client.nom}`
    );
  }


  // =========================
  // RESET FORMULAIRE
  // =========================

  resetDevisForm(): void {

    this.newDevis = {

      client_id: 0,

      produit: '',

      montant: 0,

      date_expiration: ''
    };


    this.newDevisAuto = {

      immatriculation: '',

      marque: '',

      modele: '',

      annee: null,

      puissance_fiscale: null,

      valeur_vehicule: null,

      date_premiere_mise_circulation: '',

      usage_vehicule: ''
    };
  }

}