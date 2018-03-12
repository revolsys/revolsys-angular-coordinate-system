import {AbstractCoordinateSystemComponent} from '../abstract-coordinate-system.component';
import {Component, OnInit} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import {Angle} from '../cs/Angle';
import {CS} from "../cs/CS";
import {Ellipsoid} from '../cs/Ellipsoid';
import {GeoCS} from '../cs/GeoCS';
import {CSI} from '../cs/CSI';
import {Numbers} from '../cs/Numbers';
import {ProjCS} from "../cs/ProjCS";
import {TransverseMercator} from "../cs/TransverseMercator";

@Component({
  selector: 'rs-cs-line-metrics',
  templateUrl: './line-metrics.component.html',
  styleUrls: ['./line-metrics.component.css']
})
export class LineMetricsComponent extends AbstractCoordinateSystemComponent implements OnInit {
  calculations = {
    "Distance and Angles": ["fromPoint", "fromHeight", "toPoint", "toHeight"],
    "Distance Reduction to the Ellipsoid": ["fromPoint", "fromHeight", "From Height of Instrument", "From Height of Target", "toPoint", "toHeight", "toDistance", "type"],
    "Distance Reduction from the Ellipsoid": ["fromPoint", "fromHeight", "toPoint", "toHeight"],
    "Direction Reduction to the Ellipsoid": ["fromPoint", "fromHeight", "xi", "eta", "toPoint", "toHeight", "observedDirection"],
    "Direction Reduction from the Ellipsoid": ["fromPoint", "fromHeight", "xi", "eta", "toPoint", "toHeight", "reducedDirection"],
    "Azimuth Reduction to the Ellipsoid": ["fromPoint", "fromHeight", "xi", "eta", "toPoint", "astronomicAzimuth"],
    "Azimuth Reduction from the Ellipsoid": ["fromPoint", "fromHeight", "xi", "eta", "toPoint", "toHeight"]
  };

  form: FormGroup;

  hasResult = false;

  azimuth1: number;

  azimuth2: number;

  distance: number;

  azimuth1Ellipsoid: number;

  azimuth2Ellipsoid: number;

  distanceEllipsoid: number;

  spatialDistance: number;

  astronomicAzimuth: number;

  geodeticAzimuth: number;

  slopeDistance: number;

  spatialDirection: number;

  ttCorrection: number;

  lineScaleFactor: number;

  constructor(private fb: FormBuilder) {
    super('DMS');
    this.form = this.fb.group({
      fromPoint: this.fb.group({
        x: ['', Validators.required],
        y: ['', Validators.required]
      }),
      fromHeight: ['', [Validators.required, Validators.min(0), Validators.max(5000)]],
      xi: ['', [Validators.required, Validators.min(-30), Validators.max(30)]],
      eta: ['', [Validators.required, Validators.min(-30), Validators.max(30)]],
      toPoint: this.fb.group({
        x: ['', Validators.required],
        y: ['', Validators.required]
      }),
      toHeight: ['', [Validators.min(0), Validators.max(5000)]],
      cs: this.cs,
      reducedDirection: null,
      astronomicAzimuth: null
    });
    this.form.valueChanges.subscribe(data => {
      this.calculate(data);
    });
  }

  private calculate(data: any) {
    const cs: CS = data.cs;
    let geoCS: GeoCS;
    if (cs instanceof GeoCS) {
      geoCS = cs;
    } else if (cs instanceof ProjCS) {
      geoCS = cs.geoCS;
    }
    this.cs = data.cs;
    const x1 = cs.toNumber(data.fromPoint.x);
    const y1 = cs.toNumber(data.fromPoint.y);
    const x2 = cs.toNumber(data.toPoint.x);
    const y2 = cs.toNumber(data.toPoint.y);
    if (x1 != null && y1 != null && x2 != null && y2 != null) {
      const ellipsoid = geoCS.ellipsoid;
      const lonLat1 = cs.convertPoint(geoCS, x1, y1);
      const lon1 = lonLat1[0];
      const lat1 = lonLat1[1];
      const lonLat2 = cs.convertPoint(geoCS, x2, y2);
      const lon2 = lonLat2[0];
      const lat2 = lonLat2[1];

      this.hasResult = true;
      this.distanceEllipsoid = ellipsoid.distanceMetres(lon1, lat1, lon2, lat2);
      this.azimuth1Ellipsoid = ellipsoid.azimuth(lon1, lat1, lon2, lat2);
      this.azimuth2Ellipsoid = ellipsoid.azimuth(lon2, lat2, lon1, lat1);
      if (cs instanceof ProjCS) {
        this.distance = cs.distanceMetres(x1, y1, x2, y2);
        this.azimuth1 = cs.angle(x1, y1, x2, y2);
        this.azimuth2 = cs.angle(x2, y2, x1, y1);
      } else {
        this.distance = null;
        this.azimuth1 = null;
        this.azimuth2 = null;
      }

      if (cs instanceof TransverseMercator) {
        this.lineScaleFactor = cs.lineScaleFactor(x1, y1, x2, y2);
        this.ttCorrection = cs.ttCorrection(x1, y1, x2, y2);
      } else {
        this.lineScaleFactor = null;
        this.ttCorrection = null;
      }
      const height1 = parseFloat(data.fromHeight);
      const height2 = parseFloat(data.toHeight);
      const xi = parseFloat(data.xi) / 3600;
      const eta = parseFloat(data.eta) / 3600;
      const reducedDirection = Angle.toDecimalDegrees(data.reducedDirection);
      const astronomicAzimuth = Angle.toDecimalDegrees(data.astronomicAzimuth);
      if (this.isCalculationValid('Distance Reduction from the Ellipsoid')) {
        this.spatialDistance = ellipsoid.distanceMetresZ(lon1, lat1, height1, lon2, lat2, height2);
      } else {
        this.spatialDistance = null;
      }
      if (this.isCalculationValid('Direction Reduction from the Ellipsoid')) {
        this.spatialDirection = ellipsoid.spatialDirection(lon1, lat1, height1, xi, eta, lon2, lat2, height2, 0, 0, -4.5, reducedDirection);
      } else {
        this.spatialDirection = null;
      }
      if (this.isCalculationValid('Azimuth Reduction from the Ellipsoid')) {
        this.astronomicAzimuth = ellipsoid.astronomicAzimuth(lon1, lat1, height1, xi, eta, lon2, lat2, height2);
        this.slopeDistance = ellipsoid.slopeDistance(lon1, lat1, height1, lon2, lat2, height2, 0, 0, -4.5);
      } else {
        this.astronomicAzimuth = null;
        this.slopeDistance = null;
      }
      if (this.isCalculationValid('Azimuth Reduction to the Ellipsoid')) {
        this.geodeticAzimuth = ellipsoid.geodeticAzimuth(lon1, lat1, height1, xi, eta, lon2, lat2, height2, 0, 0, -4.5, astronomicAzimuth);
      } else {
        this.geodeticAzimuth = null;
      }
    } else {
      this.hasResult = false;
    }
  }
  ngOnInit() {
    //    this.form.patchValue({
    //      cs: CSI.utmN(10),
    //      fromPoint: {
    //        x: '-1000000',
    //        y: '5200000'
    //      },
    //      toPoint: {
    //        x: '1000000',
    //        y: '6900000'
    //      },
    //    });

    this.form.patchValue({
      fromPoint: {
        x: '-109',
        y: '45'
      },
      fromHeight: 10,
      toPoint: {
        x: '-110',
        y: '46'
      },
      toHeight: 20,
      xi: 10,
      eta: 10,
      reducedDirection: 60,
      astronomicAzimuth: 60
    });

    //    this.form.patchValue({
    //      fromPoint: {
    //        x: '-121',
    //        y: '50'
    //      },
    //      toPoint: {
    //        x: '-120',
    //        y: '51'
    //      }
    //    });
  }

  isCalculationValid(calculationName: string) {
    const fieldNames = this.calculations[calculationName];
    if (this.form.valid) {
      for (const fieldName of fieldNames) {
        const value = this.form.controls[fieldName].value;
        if (value === '' || value === null) {
          return false;
        }
      }
      return true;
    } else {
      return false;
    }
  }
}
