import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChildRelation } from './child-relation';

describe('ChildRelation', () => {
  let component: ChildRelation;
  let fixture: ComponentFixture<ChildRelation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChildRelation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChildRelation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
