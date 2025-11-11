//布局时，（640的设计稿）设计稿尺寸除以100,标注字体除以100
fn();
window.addEventListener("resize",fn);
function fn(){
	var deviceWidth = document.documentElement.clientWidth||document.body.clientWidth;
	if(deviceWidth > 750) {
		deviceWidth = 750;
	}
	document.getElementsByTagName('html')[0].style.fontSize=deviceWidth /7.5 + 'px';
}