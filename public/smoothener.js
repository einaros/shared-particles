(function(exports) {
    exports.smoothener = {
        // somewhat fakes an interpolation between two points,
        // using the same points as control
        getSmoothPointSpread: function(movementInfo, pointSpread) {
            if (movementInfo.dist > pointSpread) {
                var points = [ 
                    {x: movementInfo.px, y: movementInfo.py}, 
                    {x: movementInfo.px, y: movementInfo.py}, 
                    {x: movementInfo.x, y: movementInfo.y}, 
                    {x: movementInfo.x, y: movementInfo.y}
                ];
                points = smoothener.hermiteInterpolatePoints(points, movementInfo.dist / pointSpread, 0.0, 0.0);
                points.push({x: movementInfo.x, y: movementInfo.y});
                return points;
            }
            return [
                {x: movementInfo.px, y: movementInfo.py}, 
                {x: movementInfo.x, y: movementInfo.y}
            ];
        },
        // takes four points, and interpolates between 2 and 3, 
        // using 1 and 4 as control points
        interpolate: function(points, stepSize) {
            var spread = Math.sqrt(Math.pow(points[2].x - points[1].x, 2) + 
                                   Math.pow(points[2].y - points[1].y, 2));
            var numSteps = Math.max(3, spread / stepSize);
            //points = this._evenPointSpread(points, spread);
            return smoothener.hermiteInterpolatePoints(points, numSteps, 0, 0);
        },
        hermiteInterpolatePoints: function(pointArray, numSteps, tension,  bias) {
            var stepsize = 1 / numSteps;
            var smoothPoints = [];
            var pointsJagged = [];
            for (var i = 0; i < pointArray.length; ++i) {
                pointsJagged.push(pointArray[i]);
            }
            for (var i = 1; i < pointsJagged.length - 2; ++i) {
                for (var steps = 0; steps <= 1; steps += stepsize) {
                    var p = MathEx.Interpolate.hermite2d(
                            pointsJagged[i - 1],
                            pointsJagged[i],
                            pointsJagged[i + 1],
                            pointsJagged[i + 2],
                            steps,
                            tension,
                            bias);
                    smoothPoints.push(p);
                }
            }
            // todo: the smoothPoints don't always include the last jagged point
            // adopting an algorithm from paper.js is probably a better idea than doing
            // this internally
            return smoothPoints;
        },
        _evenPointSpread: function(points, spread) {
            var newPoints = [];
            var prevPoint = {};
            var totalDistance = 0;
            var i = 0;
            while(i < points.length) {
                if (i > 0) {
                    var distance = MathEx.distance(points[i].x, points[i].y, prevPoint.x, prevPoint.y);
                    totalDistance += distance;
                    if (i == points.length - 1 ||
                       Math.abs(totalDistance - spread) < 0.1 * spread ||
                       totalDistance > spread) {
                        newPoints.push(points[i]);
                        totalDistance = 0;
                    }
                    prevPoint = points[i];
                }
                else {
                    newPoints.push(points[i]);
                    prevPoint = points[i];
                }
                ++i;
            }
            return newPoints;
        },    
    }
})(window);
