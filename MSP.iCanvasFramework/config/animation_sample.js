var odcCtrl = function () {
    //put private content here
    var _wrapper, _base, _baseType;

    return {
        bindiCanvasInstance: function (iCanvas) {
            //Function to initialize the variables
            if (!iCanvas instanceof canvasWrapper) {
                throw ("iCanvas instance required");
            }
            //bind the _wrapper variable with the current canvas wrapper instance
            _wrapper = iCanvas;

            //Call the canvas wrapper API to get an object instance of the baseClass
            _base = _wrapper.getBaseCtrlObj();

            //Get the baseClass definition from the baseClass instance
            _baseType = _base.constructor;

            return this;

        }
        , applyImgBtn: function () {
            //Function to extend a new control named imgBtn (image button)
            if (!_wrapper || !_base) {
                throw ("need to bind an iCanvas instance first");
            }

            //define a new control by inheriting from the control base class, which just returned from the function above.
            var imgBtn = function (wrapper, x, y, w, h, text, color, img, sx, sy, sw, sh) {
                //copy all basetype properties
                _baseType.apply(this, arguments);

                //Add new properties to current control
                this.backColor = color;
                this.img = img;
                this.imgRect = {
                    sx: sx
                    , sy: sy
                    , sw: sw
                    , sh: sh
                };

                var that = this;

                //define the end X
                this.ex = function () {
                    return that.sx + that.w;
                }

                //Customize the rendering logic for current control.
                this.addRenderHandler(function () {
                    this.wrapper.drawRect(this.sx, this.sy, this.w, this.h, this.backColor);
                    this.wrapper.drawImg(this.img, this.imgRect.sx, this.imgRect.sy, this.imgRect.sw, this.imgRect.sh, this.sx, this.sy, this.w, this.h);
                });
            }
            //copy the prototype, by calling the function inheritPrototype from the framework.
            inheritPrototype(imgBtn, _baseType);

            //Adding new function to the existing canvas wrapper instance
            _wrapper.drawImg = function (image, sx, sy, sw, sh, dx, dy, dw, dh) {
                var _c = this.ctx;
                _c.save();
                _c.translate(dx, dy);
                _c.drawImage(image, sx, sy, sw, sh, 0, 0, dw, dh);
                _c.restore();
            }

            //Append adding control API to the existing canvas wrapper instance
            _wrapper.addImgBtn = function (x, y, w, h, text, color, img, sx, sy, sw, sh, parentCtrl) {
                var _imgBtn = new imgBtn(this, x, y, w, h, text, color, img, sx, sy, sw, sh);
                _imgBtn.setZIndex(6);
                _imgBtn.setParent(parentCtrl);
                this.ctrlList.push(_imgBtn);
                return _imgBtn;
            }

            return this;
        }
    }

}();

var _winonload = window.onload;

window.onload = function () {
    if (_winonload) {
        _winonload.apply(this);
    }

    //Create a canvas wrapper instance
    var iCanvasInstance = new canvasWrapper("c1");

    /*******************
    //By calling the functions in odcCtrl object defined above, it is possible to extend image button on current canvas wrapper instance.
    odcCtrl.bindiCanvasInstance(iCanvasInstance).applyImgBtn();
    ***********************/

    //Create a banner control as a background.
    var bigBack = iCanvasInstance.addBanner(0, 0, 711, 143, "white");

    //Create a button
    var _btn = iCanvasInstance.addButton(0, 0, 1, 1, "$", "red", bigBack);

    //Attach onclick handler to the btn
    _btn.onclick(function () { alert(1)});

    //Create another botton
    var _btn2 = iCanvasInstance.addButton(600, 0, 1, 1, "&", "yellow", bigBack);

    //The 3rd button
    var _btn3 = iCanvasInstance.addButton(650, 10, 40, 50, "Me", "blue", bigBack);

    //Create an animation context instance, with the FPS 20
    var ani1 = iCanvasInstance.addAnimation(20);
    //by calling the applyCtrl method to indicate the bigBack control needs to be repainted when the animation starts
    ani1.applyCtrl(bigBack);
    //Same as above, _btn3 also needs to be repainted during the animation.
    ani1.applyCtrl(_btn3);

    //Start to log control changing path. The following changes will happen one by one
    ani1.logChanges(_btn, { sx: 50, sy: 20, w: 150, h: 35 }, 0, 3);
    ani1.logChanges(_btn, { sx: 100, sy: 10, w: -70, h: 45 }, 0, 2);
    ani1.logChanges(_btn, { sx: 10, sy: 10, w: -20, h: -20 }, 0, 1);
    ani1.logChanges(_btn, { sx: -10, sy: -10, w: 20, h: 20 }, 0, 1);
    ani1.logChanges(_btn, { sx: 10, sy: 10, w: -20, h: -20 }, 0, 1);
    ani1.logChanges(_btn, { sx: -10, sy: -10, w: 20, h: 20 }, 0, 1);
    ani1.logChanges(_btn, { sx: 10, sy: 10, w: -20, h: -20 }, 0, 1);
    ani1.logChanges(_btn, { sx: -10, sy: -10, w: 20, h: 20 }, 0, 1);
    ani1.logChanges(_btn, { sx: 10, sy: 10, w: -20, h: -20 }, 0, 1);
    ani1.logChanges(_btn, { sx: -10, sy: -10, w: 20, h: 20 }, 0, 1);

    //Register changing trace for button 2.
    ani1.logChanges(_btn2, { sx: -90, sy: 40, w: 50, h: 50 }, 0, 3);
    ani1.logChanges(_btn2, { sx: -120, sy: 10, w: 40, h: 20 }, 0, 2);
    ani1.logChanges(_btn2, { sx: 20 }, 0, 1);
    ani1.logChanges(_btn2, { sx: -20 }, 0, 1);
    ani1.logChanges(_btn2, { sx: 20 }, 0, 1);
    ani1.logChanges(_btn2, { sx: -20 }, 0, 1);
    ani1.logChanges(_btn2, { sy: 10 }, 80, 1);
    ani1.logChanges(_btn2, { sy: -10 }, 0, 1);
    ani1.logChanges(_btn2, { sy: 10 }, 0, 1);
    ani1.logChanges(_btn2, { sy: -10 }, 0, 1);

    //Active the animation so it will start when the timer trigger is pulled.
    ani1.active();

    //Pull the timer trigger
    iCanvasInstance.autoStart();
    
    //If there is no animation, by calling the render method from the canvas wrapper instance,
    //we can pull the trigger to render all the controls within the object.
    //iCanvasInstance.render();
}



