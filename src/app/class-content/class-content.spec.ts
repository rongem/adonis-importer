import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassContent } from './class-content';

describe('ClassContent', () => {
  let component: ClassContent;
  let fixture: ComponentFixture<ClassContent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassContent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClassContent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
