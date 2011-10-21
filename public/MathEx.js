(function(exports) {
    exports.MathEx = {
        roundTo: function(n, precision) {
            p=Math.pow(10, precision);
            return ~~(n*p)/p;
        },
        distance: function(x0, y0, x1, y1) {   
            return Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
        },
        distanceArray: function(pointArray) {
            if (pointArray.length < 2) return 0;
            var d = 0;
            for (var i = 0; i < pointArray.length - 1; ++i) {
                d += MathEx.distance(pointArray[i].x, pointArray[i].y,
                                     pointArray[i + 1].x, pointArray[i + 1].y);
            }
            return d;
        },
        bounded: function(n, min, max) {
            return Math.min(max, Math.max(min, n));
        },
        random: function(min, max) {
            return Math.random() * (max - min) + min;
        },
        Interpolate: {
            cubic: function(y0, y1, y2, y3, mu) {
                var a0,a1,a2,a3,mu2;
                mu2 = mu * mu;
                a0 = -0.5*y0 + 1.5*y1 - 1.5*y2 + 0.5*y3;
                a1 = y0 - 2.5*y1 + 2*y2 - 0.5*y3;
                a2 = -0.5*y0 + 0.5*y2;
                a3 = y1;
                return a0*mu*mu2+a1*mu2+a2*mu+a3;
            },
            hermite1d: function(y0, y1, y2, y3, mu, tension, bias) {
                var m0, m1, mu2, mu3, a0, a1, a2, a3;
                mu2 = mu*mu;
                mu3 = mu2*mu;
                m0 = (y1 - y0)*(1 + bias)*(1 - tension)/2;
                m0 += (y2 - y1)*(1 - bias)*(1 - tension)/2;
                m1 = (y2 - y1)*(1 + bias)*(1 - tension)/2;
                m1 += (y3 - y2)*(1 - bias)*(1 - tension)/2;
                a0 = 2*mu3 - 3*mu2 + 1;
                a1 = mu3 - 2*mu2 + mu;
                a2 = mu3 - mu2;
                a3 = -2*mu3 + 3*mu2;
                return a0*y1 + a1*m0 + a2*m1 + a3*y2;
            },
            hermite2d: function(pt0, pt1, pt2, pt3, mu, tension, bias) {
                var ret = {x: 0, y: 0};
                ret.x = this.hermite1d(pt0.x, pt1.x, pt2.x, pt3.x, mu, tension, bias);
                ret.y = this.hermite1d(pt0.y, pt1.y, pt2.y, pt3.y, mu, tension, bias);
                return ret;
            },
        },
    }
})(typeof exports == "undefined" ? window : exports);
