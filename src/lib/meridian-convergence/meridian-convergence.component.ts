import {AbstractCoordinateSystemComponent} from '../abstract-coordinate-system.component';
import {Angle} from '../cs/Angle';
import {CS} from '../cs/CS';
import {GeoCS} from '../cs/GeoCS';
import {ProjCS} from '../cs/ProjCS';
import {CSI} from '../cs/CSI';
import {TransverseMercator} from '../cs/TransverseMercator';
import {Component, OnInit, Injector} from '@angular/core';
import {FormGroup, FormBuilder} from '@angular/forms';

@Component({
  selector: 'rs-cs-meridian-convergence',
  templateUrl: './meridian-convergence.component.html',
  styles: [`
.mat-card {
  max-width: 1024px;
  margin: 0.5em auto 0.5em auto;
}
`]
})
export class MeridianConvergenceComponent extends AbstractCoordinateSystemComponent implements OnInit {
  private static UTM_10 = CSI.utmN(10);

  get cs(): CS {
    return this.geoCoordinateSystem;
  }

  geoCoordinateSystems: CS[] = [CSI.NAD83];

  geoCoordinateSystem = CSI.NAD83;

  projCoordinateSystems: CS[] = [CSI.utmN(7), CSI.utmN(8), CSI.utmN(9), MeridianConvergenceComponent.UTM_10, CSI.utmN(11)];

  projCoordinateSystem: TransverseMercator = MeridianConvergenceComponent.UTM_10;

  form: FormGroup;

  hasResult = false;

  meridianConvergence: number;

  pointScaleFactor: number;

  constructor(
    protected injector: Injector,
    private fb: FormBuilder) {
    super(injector, 'Meridian Convergence/POINT SF', 'DMS');
    this.createForm();
  }


  private createForm() {
    this.form = this.fb.group({
      point: this.fb.group({
        cs: this.geoCoordinateSystem,
        x: null,
        y: null
      }),
      projCoordinateSystem: this.projCoordinateSystem,
      geoCoordinateSystem: this.geoCoordinateSystem
    });
    this.form.valueChanges.subscribe(data => {
      this.geoCoordinateSystem = data.geoCoordinateSystem;
      this.projCoordinateSystem = data.projCoordinateSystem;
      const lon = this.geoCoordinateSystem.toX(data.point.x);
      const lat = this.geoCoordinateSystem.toY(data.point.y);

      if (lon != null && lat != null) {
        this.hasResult = true;
        this.calculate(lon, lat);
      } else {
        this.hasResult = false;
      }
    });
  }

  ngOnInit() {
    //    this.form.patchValue({
    //      point: {
    //        x: '-109',
    //        y: '45'
    //      },
    //    });
  }

  private calculate(lon: number, lat: number) {
    lon = -lon;
    const projCs = this.projCoordinateSystem;
    const geoCs = this.geoCoordinateSystem;

    const a = geoCs.ellipsoid.semiMajorAxis;
    const b = geoCs.ellipsoid.semiMinorAxis;

    const sf1 = projCs.ko;
    const centralMeridan = -projCs.centralMeridan;


    const phi = geoCs.toRadians(lat);
    const lambda = geoCs.toRadians(lon);
    const crad = geoCs.toRadians(centralMeridan);
    const deltaLambda = -lambda + crad;
    this.pointScaleFactor = this.calculatePointScaleFactor(phi, deltaLambda, sf1, a, b);
    this.meridianConvergence = this.calculateMeridianConvergence(phi, deltaLambda, sf1, a, b);
  }

  private calculatePointScaleFactor(phi: number, deltaLambda: number, sfo: number, a: number, b: number): number {
    const dlamSq = deltaLambda * deltaLambda;
    const bSq = b * b;
    const cp = Math.cos(phi);
    const cpSq = cp * cp;

    const t = Math.tan(phi);
    const tSq = t * t;
    const eta = Math.sqrt((a * a - bSq) / bSq * cpSq);

    const etaSq = eta * eta;
    let sf = dlamSq * cpSq / 2 * (etaSq + 1) + 1
      + dlamSq * dlamSq * (cpSq * cpSq) / 24 * (5 - tSq * 4);
    sf *= sfo;

    return sf;
  }


  private calculateMeridianConvergence(phi: number, deltaLambda: number, sfo: number,
    a: number, b: number): number {
    const dlamSq = deltaLambda * deltaLambda;
    const cp = Math.cos(phi);
    const cpSq = cp * cp;

    const t = Math.tan(phi);
    const tSq = t * t;

    const eta = Math.sqrt((a * a - b * b) / (b * b) * cpSq);
    const etaSq = eta * eta;

    const meridianConvegence = deltaLambda * Math.sin(phi)
      * (dlamSq * cpSq / 3.0 * (etaSq * 3 + 1 + etaSq * etaSq * 2) + 1
        + dlamSq * dlamSq * cpSq * cpSq / 15.0 * (2 - tSq));

    return Angle.toDegrees360(meridianConvegence);
  }

}
