(function ($) {
    $.fn.cloudTag = function (options) {
        var defaults = {
            ballSize: 200,
            max: 3,
            interval: 50, // ms
            duration: 3 * 1000, // 3s
            tags: []
        };

        // fetch options

        var opts = $.extend({}, defaults, options);

        var duration = opts.duration;
        var interval = opts.interval; // ms
        var paper = $(this)[0];

        var RADIUS = opts.ballSize;
        var fallLength = 300;
        var angleX = Math.PI / fallLength;
        var angleY = Math.PI / fallLength;

        var CX = paper.offsetWidth / 2;
        var CY = paper.offsetHeight / 2;
        var EX = paper.offsetLeft + document.body.scrollLeft + document.documentElement.scrollLeft;
        var EY = paper.offsetTop + document.body.scrollTop + document.documentElement.scrollTop;

        // create tags

        var tags = [];

        function setup() {
            console.log("setup");
            var len = opts.tags.length;

            for (var i = 0; i < len; i++) {
                var label = opts.tags[i];

                var k = (2 * (i + 1) - 1) / len - 1;
                var a = Math.acos(k);
                var b = a * Math.sqrt(len * Math.PI);

                var x = RADIUS * Math.sin(a) * Math.cos(b);
                var y = RADIUS * Math.sin(a) * Math.sin(b);
                var z = RADIUS * Math.cos(a);

                // create anchor

                var anchor = document.createElement('a');
                $(anchor).addClass('tag').html(label).appendTo(paper);

                anchor.style.color = "rgb(" + parseInt(Math.random() * 255) + "," + parseInt(Math.random() * 255) + "," + parseInt(Math.random() * 255) + ")"; // set random color

                // create wrapper class

                var t = new tag(anchor, x, y, z);

                // remember

                tags.push(t);

                // and position

                t.move();
            } // for
        }

        // timer stuff

        function now() {
            return new Date().getTime();
        }

        var timer = undefined;
        var startTime;

        function animate() {
            if (timer === undefined) {
                startTime = now();
                timer = setInterval(function () {
                    // check duration

                    if (now() - startTime >= duration) {
                        clearInterval(timer);
                        timer = undefined;
                    } // if

                    // move tags

                    var cosX = Math.cos(angleX);
                    var sinX = Math.sin(angleX);
                    var cosY = Math.cos(angleY);
                    var sinY = Math.sin(angleY);

                    tags.forEach(function (tag) {
                        tag
                            .rotateX(cosX, sinX)
                            .rotateY(cosY, sinY)
                            .move();
                    });
                }, interval);
            } // if
        }

        // the tag class

        var tag = function (ele, x, y, z) {
            this.ele = ele; // the anchor

            this.x = x;
            this.y = y;
            this.z = z;

            return this;
        };

        tag.prototype = {
            rotateX: function (cos, sin) {
                this.y = this.y * cos - this.z * sin;
                this.z = this.z * cos + this.y * sin;

                return this;
            },

            rotateY: function (cos, sin) {
                this.x = this.x * cos - this.z * sin;
                this.z = this.z * cos + this.x * sin;

                return this;
            },

            move: function () {
                var scale = fallLength / (fallLength - this.z);
                var alpha = ((this.z + RADIUS) / (2 * RADIUS)) + 0.5;

                var style = this.ele.style;

                style.fontSize = 15 * scale + "px";
                style.opacity = alpha;
                style.filter = "alpha(opacity = " + alpha * 100 + ")";
                style.zIndex = parseInt(scale * 100);
                style.left = this.x + CX - this.ele.offsetWidth / 2 + "px";
                style.top = this.y + CY - this.ele.offsetHeight / 2 + "px";

                return this;
            }
        };

        // callback

        function onMouseMove(event) {
            var x = event.clientX - EX - CX;
            var y = event.clientY - EY - CY;

            angleY = x * 0.0001;
            angleX = y * 0.0001;

            animate(); // restart timer if required
        }

        // add event listener

        if ("addEventListener" in window)
            paper.addEventListener("mousemove", onMouseMove);
        else
            paper.attachEvent("onmousemove", onMouseMove);

        // get goin'

        setup();
        animate();
    }
})(jQuery);