import {AbstractCoordinateSystemComponent} from "../abstract-coordinate-system.component";
import {Angle} from "../cs/Angle";
import {CS} from "../cs/CS";
import {GeoCS} from "../cs/GeoCS";
import {ProjCS} from "../cs/ProjCS";
import {CSI} from "../cs/CSI";
import {TransverseMercator} from "../cs/TransverseMercator";
import {Component, OnInit} from '@angular/core';
import {FormGroup, FormBuilder} from "@angular/forms";

@Component({
  selector: 'rs-cs-scale-factor-tt-correction',
  templateUrl: './scale-factor-tt-correction.component.html',
  styles: []
})
export class ScaleFactorTtCorrectionComponent extends AbstractCoordinateSystemComponent implements OnInit {
  private static UTM_10 = CSI.utmN(10);

  projCoordinateSystems: CS[] = [CSI.utmN(7), CSI.utmN(8), CSI.utmN(9), ScaleFactorTtCorrectionComponent.UTM_10, CSI.utmN(11)];

  projCoordinateSystem: TransverseMercator = ScaleFactorTtCorrectionComponent.UTM_10;

  form: FormGroup;

  hasResult = false;

  ttCorrection: number;

  lineScaleFactor: number;

  constructor(private fb: FormBuilder) {
    super('DMS');
    this.createForm();
  }


  private createForm() {
    this.form = this.fb.group({
      fromPoint: this.fb.group({x: null, y: null}),
      toPoint: this.fb.group({x: null, y: null}),
      projCoordinateSystem: this.projCoordinateSystem
    });
    this.form.valueChanges.subscribe(data => {
      this.projCoordinateSystem = data.projCoordinateSystem;
      const projCs = this.projCoordinateSystem;
      const fromX = projCs.toNumber(data.fromPoint.x);
      const fromY = projCs.toNumber(data.fromPoint.y);
      const toX = projCs.toNumber(data.toPoint.x);
      const toY = projCs.toNumber(data.toPoint.y);

      if (fromX && fromY && toX && toY) {
        this.hasResult = true;
        this.calculate(fromX, fromY, toX, toY);
      } else {
        this.hasResult = false;
      }
    });
  }

  ngOnInit() {
    //    this.form.patchValue({
    //      fromPoint: {
    //        x: '-1000000',
    //        y: '5200000'
    //      },
    //      toPoint: {
    //        x: '1000000',
    //        y: '6900000'
    //      },
    //    });
  }

  private calculate(x1: number, y1: number, x2: number, y2: number) {
    const projCs = this.projCoordinateSystem;
    const geoCs = projCs.geoCS;
    const xo = projCs.falseEasting;
    const sf1 = projCs.scaleFactor;

    const a = geoCs.ellipsoid.semiMajorAxis;
    const b = geoCs.ellipsoid.semiMinorAxis;
    const mdeg = -projCs.centralMeridan;
    const crad = Angle.toRadians(mdeg);

    const d2 = y2 - y1;
    const d3 = x2 - x1;
    const d1 = Math.pow(d2, 2) + Math.pow(d3, 2);
    const dist = Math.pow(d1, 0.5);
    const phi1 = this.tmxypl(x1, y1, a, b, sf1, xo, crad);
    const phi2 = this.tmxypl(x2, y2, a, b, sf1, xo, crad);
    const phi = (phi1 + phi2) / 2;
    const ttls = this.ttls(a, b, phi, dist, x1, y1, x2, y2, xo, sf1);
    let tt = ttls[0];
    if (tt < 0) {
      tt = -tt;
    }
    this.lineScaleFactor = ttls[1];
    this.ttCorrection = Angle.toDegrees(tt) * 3600 % 60;
  }


  fplat(a: number, b: number, y: number): number {

    const e2 = (a * a - b * b) / (a * a);
    const e4 = e2 * e2;
    const e6 = e4 * e2;
    const e8 = e6 * e2;
    const a0 = 1. - e2 / 4. - e4 * 3. / 64. - e6 * 5. / 256. - e8 * 175. / 16384.;
    const a2 = (e2 + e4 / 4. + e6 * 15. / 128. - e8 * 455. / 4096.) * .375;
    const a4 = (e4 + e6 * 3. / 4. - e8 * 77. / 128.) * .05859375;
    const a6 = (e6 - e8 * 41. / 32.) * .011393229166666666;
    const a8 = e8 * -315. / 131072.;
    let phi1 = y / a;
    let dphi;
    do {
      dphi = (a * (a0 * phi1 - a2 * Math.sin(phi1 * 2.) + a4 * Math.sin(phi1 * 4.)
        - a6 * Math.sin(phi1 * 6.) + a8 * Math.sin(phi1 * 8.)) - y)
        / (a * (a0 - a2 * 2. * Math.cos(phi1 * 2.) + a4 * 4. * Math.cos(phi1 * 4.)
          - a6 * 6. * Math.cos(phi1 * 6.) + a8 * 8. * Math.cos(phi1 * 8.)));
      phi1 -= dphi;
    } while (Math.abs(dphi) >= 1e-15);
    return phi1;
  }

  tmxypl(x: number, y: number, a: number, b: number, sf: number,
    xo: number, cmrad: number): number {
    x = (x - xo) / sf;
    y /= sf;
    const e = Math.sqrt((a * a - b * b) / (a * a));
    const phi1 = this.fplat(a, b, y);
    const t = Math.tan(phi1);
    const sp = Math.sin(phi1);
    const cp = Math.cos(phi1);
    const eta = Math.sqrt((a * a - b * b) / (b * b) * (cp * cp));

    const dn = a / Math.sqrt(1. - e * e * (sp * sp));
    const d__2 = 1. - e * e * (sp * sp);
    const dm = a * (1. - e * e) / Math.sqrt(d__2 * (d__2 * d__2));
    const tp2 = t * t;
    const tp4 = t * t * t * t;
    const tp6 = t * t * (t * t * t * t);
    const etap2 = eta * eta;
    const etap4 = etap2 * etap2;
    const etap6 = eta * eta * (eta * eta * eta * eta);
    const etap8 = etap4 * etap4;
    const xbydn = x / dn;

    const phi = phi1 + t * (-(x * x) / (dm * 2. * dn)
      + xbydn * (xbydn * xbydn) * x / (dm * 24.)
      * (tp2 * 3. + 5. + etap2 - etap4 * 4. - etap2 * 9. * tp2)
      - xbydn * (xbydn * xbydn * xbydn * xbydn) * x / (dm * 720.)
      * (tp2 * 90. + 61. + etap2 * 46. + tp4 * 45. - tp2 * 252. * etap2 - etap4 * 3.
        + etap6 * 100. - tp2 * 66. * etap4 - tp4 * 90. * etap2 + etap8 * 88. + tp4 * 225. * etap4
        + tp2 * 84. * etap6 - tp2 * 192. * etap8)
      + xbydn * xbydn * xbydn * (xbydn * xbydn * xbydn * xbydn) * x / (dm * 40320.)
      * (tp2 * 3633. + 1385. + tp4 * 4095. + tp6 * 1574.));

    return phi;
  }

  ttls(a: number, b: number, phi1: number, dist: number,
    x1: number, y1: number, x2: number, y2: number, xo: number,
    sf: number): number[] {
    const xi = x1 - xo;
    const xj = x2 - xo;
    const bOverA = b / a;
    const esq = 1. - bOverA * bOverA;
    const sinPhi = Math.sin(phi1);
    const r = b / (1. - esq * (sinPhi * sinPhi));
    const rsq = r * r;
    const rsq6 = rsq * 6.;
    const x = xj + xi * 2.;
    const tt = (y2 - y1) * x / rsq6 * (1. - x * x / (rsq * 27.));
    const xusq = xi * xi + xi * xj + xj * xj;
    const ls = sf * (xusq / rsq6 * (xusq / (rsq * 36.) + 1.) + 1.);
    return [
      tt, ls
    ];
  }
}
