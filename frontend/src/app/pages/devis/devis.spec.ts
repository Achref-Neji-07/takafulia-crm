import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Devis } from './devis';

describe('Devis', () => {
  let component: Devis;
  let fixture: ComponentFixture<Devis>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Devis],
    }).compileComponents();

    fixture = TestBed.createComponent(Devis);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
