import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedProject } from './shared-project';

describe('SharedProject', () => {
  let component: SharedProject;
  let fixture: ComponentFixture<SharedProject>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedProject],
    }).compileComponents();

    fixture = TestBed.createComponent(SharedProject);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
