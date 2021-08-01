(function (window, undefined) {

  if (!!window.yunjicn_image_zoom) {
    return;
  }

  let document = window.document;
  let html = document.getElementsByTagName("html")[0];
  const IMAGE_ZOOM_CONTAINER_ID = "--------yunjicn-image-zoom---------plugin------------container";
  const IMAGE_ZOOM_CLOSE_BUTTON_CLASSNAME = "closeBtn";
  const IMAGE_ZOOM_IMAGE_CLASSNAME = "image-zooming";
  const IMAGE_ZOOM_CLASSNAME_ZOOMING = "--------yunjicn-image-zoom---------plugin------------classname-------zooming";

  let imageZoomStyle = document.createElement("style");
  imageZoomStyle.innerHTML = `
    html.${IMAGE_ZOOM_CLASSNAME_ZOOMING}, body.${IMAGE_ZOOM_CLASSNAME_ZOOMING}{
      overflow: hidden;
    }
    #${IMAGE_ZOOM_CONTAINER_ID} {
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 999999999;
      background-color: rgba(0, 0, 0, .6);
      opacity: 0;
      transition: opacity .2s ease-in;
    }
    #${IMAGE_ZOOM_CONTAINER_ID}.shown{
      opacity: 1;
    }
    #${IMAGE_ZOOM_CONTAINER_ID} .${IMAGE_ZOOM_CLOSE_BUTTON_CLASSNAME}{
      position: absolute;
      top: 5px;
      right: 5px;
      height: 24px;
      line-height: 24px;
      width: 24px;
      text-align: center;
      border-radius: 50%;
      color: #fff;
      font-size: 18px;
      background-color: rgba(0, 0, 0, .6);
      z-index: 999999999;
      cursor: pointer;
    }
    #${IMAGE_ZOOM_CONTAINER_ID} .${IMAGE_ZOOM_IMAGE_CLASSNAME}{
      position: absolute;
      z-index: 999999998;
      margin:0;
      padding:0;
      min-width: 0;
      max-width: none;
      min-height: 0;
      max-height: none;
      border: solid 1px #fff;
    }
  `;

  let imageZoomContainer = document.createElement("div");
  imageZoomContainer.id = IMAGE_ZOOM_CONTAINER_ID;
  imageZoomContainer.style.cssText = "display:none;";
  let imageZoomCloseButton = document.createElement("div");
  imageZoomCloseButton.innerHTML = "&times;";
  imageZoomCloseButton.classList.add(IMAGE_ZOOM_CLOSE_BUTTON_CLASSNAME);
  imageZoomContainer.appendChild(imageZoomCloseButton);
  let imageZoomImage = document.createElement("img");
  imageZoomImage.classList.add(IMAGE_ZOOM_IMAGE_CLASSNAME);
  imageZoomContainer.appendChild(imageZoomImage);

  class ImagesZoom {
    constructor() {
      this._resetData();
    }

    // 显示某个图片
    show(src) {
      if (!!src) {
        imageZoomImage.src = src;
      }
    }

    // 组件初始化
    init(param) {

      if (!!document.getElementById(IMAGE_ZOOM_CONTAINER_ID)) {
        return;
      }

      this._resetData();

      this.params = param || {};

      document.head.appendChild(imageZoomStyle);
      let containerClasses = this.params.containerClasses;
      if (!!containerClasses) {
        imageZoomContainer.classList.add(containerClasses);
      }
      document.body.appendChild(imageZoomContainer);

      imageZoomImage.addEventListener("load", (event) => this._show(event));
      imageZoomImage.addEventListener("touchstart", (event) => this._touchstart(event));
      imageZoomImage.addEventListener("touchmove", (event) => this._touchmove(event));
      imageZoomImage.addEventListener("touchend", (event) => this._touchend(event));
      imageZoomImage.addEventListener("mousedown", (event) => this._mousedown(event));
      imageZoomImage.addEventListener("mousemove", (event) => this._mousemove(event));

      imageZoomContainer.addEventListener("click", (event) => this._mouseclick(event));
      imageZoomContainer.addEventListener("wheel", (event) => this._zoomByWheel(event));
      imageZoomContainer.addEventListener("transitionend", (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (imageZoomContainer.classList.contains("shown")) {
          imageZoomContainer.style.cssText = "display:block;";
        } else {
          imageZoomContainer.style.cssText = "display:none;";
        }
      });

      imageZoomCloseButton.addEventListener("click", (event) => this._hide(event));
    }
    _resetData() {
      this.width = 0;
      this.height = 0;
      this.left = 0;
      this.top = 0;

      this.movingByMouse = false;
      this.mouseMoveStartX = 0;
      this.mouseMoveStartY = 0;

      this.touchMultiplay = false;

      this.movingByTouch = false;
      this.touchMoveStartX = 0;
      this.touchMoveStartY = 0;

      this.zoomingByTouch = false;
      this.touchZoomStartDistance = 0;
      this.touchZoomCenterX = 0;
      this.touchZoomCenterY = 0;
    }
    _show(imageLoadEvent) {
      imageLoadEvent.preventDefault();
      imageLoadEvent.stopPropagation();

      this._resetData();

      html.classList.add(IMAGE_ZOOM_CLASSNAME_ZOOMING);
      document.body.classList.add(IMAGE_ZOOM_CLASSNAME_ZOOMING);

      let margin_h = this.params.margin_h || 25;
      let margin_v = this.params.margin_v || 25;

      let target = imageLoadEvent.target;
      let width = target.width;
      let height = target.height;

      let wh_b = width / height;	// 宽高比
      let parent_w = window.innerWidth - (margin_h * 2);
      let parent_h = window.innerHeight - (margin_v * 2);
      let pwh_b = parent_w / parent_h;
      let new_width = 0;
      let new_height = 0;
      let left = margin_h;
      let top = margin_v;
      if (wh_b > pwh_b) {
        new_width = Math.min(parent_w, width);
        new_height = new_width / wh_b;
      } else {
        new_height = Math.min(parent_h, height);
        new_width = new_height * wh_b;
      }
      if (new_width < parent_w) {
        left = (parent_w - new_width) / 2 + margin_h;
      }
      if (new_height < parent_h) {
        top = (parent_h - new_height) / 2 + margin_v;
      }
      imageZoomImage.style.width = new_width + "px";
      imageZoomImage.style.height = new_height + "px";
      imageZoomImage.style.top = top + "px";
      imageZoomImage.style.left = left + "px";

      this.width = new_width;
      this.height = new_height;
      this.top = top;
      this.left = left;

      imageZoomContainer.style.cssText = "display:block;";
      imageZoomContainer.classList.add("shown");
    }
    _hide(event) {
      event.preventDefault();
      event.stopPropagation();
      if (imageZoomContainer.classList.contains("shown")) {
        imageZoomContainer.classList.remove("shown");
      }
      imageZoomImage.src = "";
      imageZoomImage.style.cssText = "";
      this._resetData();
      if (html.classList.contains(IMAGE_ZOOM_CLASSNAME_ZOOMING)) {
        html.classList.remove(IMAGE_ZOOM_CLASSNAME_ZOOMING);
      }
      if (document.body.classList.contains(IMAGE_ZOOM_CLASSNAME_ZOOMING)) {
        document.body.classList.remove(IMAGE_ZOOM_CLASSNAME_ZOOMING);
      }
    }
    _zoomByWheel(wheelEvent) {
      wheelEvent.preventDefault();
      wheelEvent.stopPropagation();
      let clientX = wheelEvent.clientX;
      let clientY = wheelEvent.clientY;
      let delta = wheelEvent.deltaY;
      if (!delta)
        return;
      let ratio = 0.9; // 缩放比
      if (delta < 0) {
        ratio = 1.1;
      }

      let width = Math.round(this.width * ratio);
      let height = Math.round(this.height * ratio);
      let left = clientX - Math.round((clientX - this.left) * ratio);
      let top = clientY - Math.round((clientY - this.top) * ratio);

      this.width = width;
      this.height = height;
      this.left = left;
      this.top = top;

      imageZoomImage.style.width = width + "px";
      imageZoomImage.style.height = height + "px";
      imageZoomImage.style.top = top + "px";
      imageZoomImage.style.left = left + "px";
    }
    _mousedown(mouseEvent) {
      mouseEvent.preventDefault();
      mouseEvent.stopPropagation();
      this.mouseMoveStartX = mouseEvent.clientX;
      this.mouseMoveStartY = mouseEvent.clientY;
    }
    _mousemove(mouseEvent) {
      mouseEvent.preventDefault();
      mouseEvent.stopPropagation();
      if (!!mouseEvent.buttons) {
        this.movingByMouse = true;
        let clientX = mouseEvent.clientX;
        let clientY = mouseEvent.clientY;
        let distX = clientX - this.mouseMoveStartX;
        let distY = clientY - this.mouseMoveStartY;
        let top = this.top + distY;
        let left = this.left + distX;

        this.mouseMoveStartX = clientX;
        this.mouseMoveStartY = clientY;
        this.top = top;
        this.left = left;

        imageZoomImage.style.top = top + "px";
        imageZoomImage.style.left = left + "px";
      }
    }
    _mouseclick(event) {
      event.preventDefault();
      event.stopPropagation();
      if (this.movingByMouse) {
        this.movingByMouse = false;
        return;
      }
      this._hide(event);
    }
    _touchstart(touchEvent) {
      touchEvent.preventDefault();
      touchEvent.stopPropagation();
      this.movingByTouch = false;
      this.zoomingByTouch = false;

      let touchCount = touchEvent.targetTouches.length; //获得触控点数

      if (touchCount == 1) {
        this.touchMultiplay = false;
        this.touchMoveStartX = this._getTouchPosition(touchEvent, "clientX");
        this.touchMoveStartY = this._getTouchPosition(touchEvent, "clientY");
      } else {
        this.touchMultiplay = true;
        let multiTouchDist = this._getMultiTouchDist(touchEvent);
        this.touchZoomStartDistance = multiTouchDist.dist;
        this.touchZoomCenterX = multiTouchDist.x;
        this.touchZoomCenterY = multiTouchDist.y;
      }
    }
    _touchmove(touchEvent) {
      touchEvent.preventDefault();
      touchEvent.stopPropagation();
      var touchTarget = touchEvent.targetTouches.length; //获得触控点数
      if (touchTarget == 1 && !this.touchMultiplay) {
        this.movingByTouch = true;
        this._moveByTouch(touchEvent);
      } else if (touchTarget >= 2) {
        this.zoomingByTouch = true;
        this._zoomByTouch(touchEvent);
      }
    }
    _touchend(touchEvent) {
      touchEvent.preventDefault();
      touchEvent.stopPropagation();
      if (!this.movingByTouch && !this.zoomingByTouch) {
        this._hide(touchEvent);
        return;
      };
    }
    _moveByTouch(touchEvent) {
      touchEvent.preventDefault();
      touchEvent.stopPropagation();

      let clientX = this._getTouchPosition(touchEvent, "clientX");
      let clientY = this._getTouchPosition(touchEvent, "clientY");

      let distX = clientX - this.touchMoveStartX;
      let distY = clientY - this.touchMoveStartY;
      let top = this.top + distY;
      let left = this.left + distX;

      this.touchMoveStartX = clientX;
      this.touchMoveStartY = clientY;
      this.top = top;
      this.left = left;

      imageZoomImage.style.top = top + "px";
      imageZoomImage.style.left = left + "px";
    }
    _zoomByTouch(touchEvent) {
      touchEvent.preventDefault();
      touchEvent.stopPropagation();


      let currentDistance = this._getMultiTouchDist(touchEvent).dist;
      let ratio = currentDistance / this.touchZoomStartDistance;


      let width = Math.round(this.width * ratio);
      let height = Math.round(this.height * ratio);
      let left = this.touchZoomCenterX - Math.round((this.touchZoomCenterX - this.left) * ratio);
      let top = this.touchZoomCenterY - Math.round((this.touchZoomCenterY - this.top) * ratio);

      this.touchZoomStartDistance = currentDistance;
      this.width = width;
      this.height = height;
      this.left = left;
      this.top = top;


      imageZoomImage.style.width = width + "px";
      imageZoomImage.style.height = height + "px";
      imageZoomImage.style.top = top + "px";
      imageZoomImage.style.left = left + "px";

    }
    _getMultiTouchDist(touchEvent) {
      let x1 = 0;
      let y1 = 0;
      let x2 = 0;
      let y2 = 0;
      let x3 = 0;
      let y3 = 0;
      let result = {};

      x1 = touchEvent.touches[0].clientX;
      x2 = touchEvent.touches[1].clientX;
      y1 = touchEvent.touches[0].clientY;
      y2 = touchEvent.touches[1].clientY;

      if (!x1 || !x2)
        return;

      if (x1 <= x2) {
        x3 = (x2 - x1) / 2 + x1;
      } else {
        x3 = (x1 - x2) / 2 + x2;
      }
      if (y1 <= y2) {
        y3 = (y2 - y1) / 2 + y1;
      } else {
        y3 = (y1 - y2) / 2 + y2;
      }

      result = {
        dist: Math.round(Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))),
        x: Math.round(x3),
        y: Math.round(y3)
      };
      return result;
    }
    _getTouchPosition(event, positionPropertyName) {
      return ("ontouchstart" in window) ? event.changedTouches[0][positionPropertyName] : event[positionPropertyName];
    }
  }


  window.yunjicn_image_zoom = new ImagesZoom();
})(window);
