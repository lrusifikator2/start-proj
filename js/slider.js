/*
slider(
	slider_item = "slide", 
	slider_item = "dot", 
	buttons = ["left", "right"],
	speed=1000,
	open=1
);
*/

// functoin vertical_slider()

function	slider(slider_item, dot_item="", buttons=[], speed=1000, open=0, items_per_slide=1, animation="linear", pos=0){
	// multiple items
	// половинчатые переходы на тех где много айтемов

	// draggable 

	// auto
	// auto_speed
	
	// make from it a class
	// find out class switch_to* was called from and fill the vraibles with this information
	// animation type (none, fade, slide, halfslide)
	
	// slider type (circl, line, ...)
	
	var items = document.getElementsByClassName(slider_item);	
	
	// creating slider and slider container class
	var slider = document.createElement("div");
	var content = document.createElement("div");

	if(buttons.length == 2){
		var left_btns =  document.getElementsByClassName(buttons[0])[0];
		var rght_btns = document.getElementsByClassName(buttons[1])[0];
		
		left_btns.setAttribute("onclick","switch_to_prev('" + slider_item + "', '" + dot_item + "', " + open + ")");
		rght_btns.setAttribute("onclick","switch_to_next('" + slider_item + "', '" + dot_item + "', " + open + ")");
	}

	slider.classList.add(slider_item + "__slider");
	content.classList.add(slider_item + "-slider__inner");

	slider.appendChild(content);

	items[0].parentNode.style.overflow = "hidden";
	items[0].parentNode.appendChild(slider); 
	
	$(items).prependTo(content); //replace it with pure js //moving all items into slider container
	
	//styling container
	content.style.whiteSpace = "nowrap";
	content.style.display = "inline-block";
	content.style.height = "100%";
	content.style.width = "100%";
	content.style.transition = "transform " + speed + "ms " + animation;

	//styling items
	for(var i = 0; i < slider_len(items); i++){
		items[i].style.display = "inline-block";
		items[i].style.height = "100%";
		items[i].style.width = (1/items_per_slide * 100) + "%"; 
	}

	//creating dots
	if(dot_item != ""){
		var dots = document.getElementsByClassName(dot_item);
		multiply_el(dots[0], slider_len(items)/items_per_slide);
		
		//creating onlick="switch_to()"
		set_dots_functions(dots, slider_item);
	}
	
	switch_to(slider_item, pos, dot_item);
}


async function slider_auto(){
	;
}

function slider_position(items, items_class, dot_item){
	var lst = "";
	for(var i=0; i < slider_len(items); i++){
		if(items[i].classList == (items_class + " " + items_class + "_active"))
			return i;
	}	

	switch_to(slider_item, 0, dot_item);
	return 0;
}

function switch_to_prev(items_class, dot_item, open) {
	items = document.getElementsByClassName(items_class);
	pos = slider_position(items, items_class, dot_item);

	if(pos == 0){
		if(open) 
			pos = slider_len(items) - 1;
	} else 
		pos -= 1;

	switch_to(items_class, pos, dot_item);
}

function switch_to_next(items_class, dot_item, open) {
	items = document.getElementsByClassName(items_class);
	pos = slider_position(items, items_class, dot_item);

	if( pos >= (slider_len(items) - 1) ) {
		if(open){
			// crate pseudo element
			// swith to pseudoelement
			// set dots to last
			// if
			//		swiches to lower then cur then display none cur; 
			// suka blyat pizdec
			pos = 0;
		}
	} else 
		pos += 1;

	switch_to(items_class, pos, dot_item);
}


function switch_to(items_class, num, dot_item){
	var items = document.getElementsByClassName(items_class);
	var dots = document.getElementsByClassName(dot_item);

	for(var i=0; i < slider_len(items); i++){
		items[i].classList = items_class;

		if(num == i){
			items[i].classList.add(items_class + "_active");
		}
	}

	for(var i=0; i < slider_len(items); i++){
		dots[i].classList = dot_item;

		if(num == i){
			dots[i].classList.add(dot_item + "_active");
		}
	}

	num = -1 * num;
	items[0].parentNode.style.transform = "translateX(" + (num * 100) + "%)";

}

function slider_len(items){ return items.length;}
function set_dots_functions(dots, slider_cont) {
	for(var i = 0; i < dots.length; i++){
		dots[i].setAttribute("onclick","switch_to('" + slider_cont + "', " + i + ", '" + dots[0].className.split(" ")[0] + "')");
	}
}

function multiply_el(el, num) {
	var class_name = el.className;
	var par = el.parentNode;
	var clone; 

	for(var i = 1; i < num ; i++) {
		clone = el.cloneNode(true);
		clone.classList.add(class_name + "__" + i);	
		par.append(clone);
	}

	el.classList.add(class_name + "__0");
}
