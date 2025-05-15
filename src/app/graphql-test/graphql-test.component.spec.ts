import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphqlTestComponent } from './graphql-test.component';

describe('GraphqlTestComponent', () => {
  let component: GraphqlTestComponent;
  let fixture: ComponentFixture<GraphqlTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraphqlTestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraphqlTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
