import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ZagIt } from './zag-it.directive';

describe('ZagJsAngularComponent', () => {
    let directive: ZagIt;
    let fixture: ComponentFixture<ZagIt>;

    beforeEach(async () => {
        await TestBed
            .configureTestingModule({
                imports: [ZagIt]
            })
            .compileComponents();

        fixture = TestBed.createComponent(ZagIt);
        directive = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(directive).toBeTruthy();
    });
});
