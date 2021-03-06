/* ------------------------------------------------------------------------
Class: freezeHeader
Use:freeze header row in html table
Example 1:  $('#tableid').freezeHeader();
Example 2:  $("#tableid").freezeHeader({ 'height': '300px' });
Example 3:  $("table").freezeHeader();
Example 4:  $(".table2").freezeHeader();
Example 5:  $("#tableid").freezeHeader({ 'offset': '50px' });
Author(s): Laerte Mercier Junior, Larry A. Hendrix
Version: 1.0.7
-------------------------------------------------------------------------*/
(function ($) {
    var TABLE_ID = 0;
    $.fn.freezeHeader = function (params) {

        var copiedHeader = false;
	function normalizeHeader(obj){
		var id="#"+obj.id,    
        head=$vui("<thead/>").prependTo(id);
        
    	$vui(id+" tbody tr").slice(0,obj.headerRows).appendTo(head);
	}
        function freezeHeader(elem) {
            var idObj = elem.attr('id') || ('tbl-' + (++TABLE_ID));
            if (elem.length > 0 && elem[0].tagName.toLowerCase() == "table") {

                var obj = {
                    id: idObj,
                    grid: elem,
                    container: null,
                    header: null,
                    divScroll: null,
                    openDivScroll: null,
                    closeDivScroll: null,
                    fromTop:"4px", //distance of the cloned header from top of the page
                    scroller: null,
               	    normalizeHeader:true,   // Sometimes tables are generated without thead tag
                    headerRows:1, //number of header rows (if header should be normalized)
                    widthRatio:100, // Table width if expressed in percent. Set it to 95 if width is 95%  
                    headerStyle:"background-color:#4E4D4D;opacity:0.9", //Style added to the cloned header
                    minHeightWindow:600  //don't freeze if height is smaller than this
                };
                
		if (params){
			$.extend(obj,params,true);	
		}
                if ($(document).height()<obj.minHeightWindow){
                   return;
                }                
		if (obj.normalizeHeader){
			normalizeHeader(obj);
		}

                if (params && params.height !== undefined) {
                    obj.divScroll = '<div id="hdScroll' + obj.id + '" style="height: ' + params.height + '; overflow-y: scroll">';
                    obj.closeDivScroll = '</div>';
                }

                obj.header = obj.grid.find('thead');

                if (params && params.height !== undefined) {
                    if ($('#hdScroll' + obj.id).length == 0) {
                        obj.grid.wrapAll(obj.divScroll);
                    }
                }

                obj.scroller = params && params.height !== undefined
                   ? $('#hdScroll' + obj.id)
                   : $(window);

                if (params && params.scrollListenerEl !== undefined) {
                    obj.scroller = params.scrollListenerEl;
                }
                obj.scroller.on('scroll', function () {
                    if ($('#hd' + obj.id).length == 0) {
                        obj.grid.before('<div id="hd' + obj.id + '"></div>');
                    }

                    obj.container = $('#hd' + obj.id);
		    
                    if (obj.header.offset() != null) {
                        if (limiteAlcancado(obj, params)) {
                            if (!copiedHeader) {
                                cloneHeaderRow(obj);
                                copiedHeader = true;
                            }
                        }
                        else {

                            if (($(document).scrollTop() > obj.header.offset().top)) {
                               // obj.container.css("position", "absolute");
                               // obj.container.css("top", (obj.grid.find("tr:last").offset().top - obj.header.height()) + "px");
                            }
                            else {
                                obj.container.css("visibility", "hidden");
                                obj.container.css("top", "0px");
                                obj.container.width(0);
                            }
                            copiedHeader = false;
                        }
                    }

                });
                
		        $( window ).resize(function() {
		             	params.normalizeHeader=false;
		             	copiedHeader = false;
		             	if (obj.container){
		             		obj.container.remove();	
		             	}
		             	
			});
        	}
        }

        function limiteAlcancado(obj, params) {
            if (params && (params.height !== undefined || params.scrollListenerEl !== undefined)) {
                return (obj.header.offset().top <= obj.scroller.offset().top);
            }
            else {
                return ($(document).scrollTop() > obj.header.offset().top && $(document).scrollTop() < (obj.grid.height() - obj.header.height() - obj.grid.find("tr:last").height()) + obj.header.offset().top);
            }
        }

        function cloneHeaderRow(obj) {
            obj.container.html('');
            obj.container.val('');
            var tabela = $('<table style="margin: 0 0;"></table>');
            var atributos = obj.grid.prop("attributes");
	    var cloneHead=$('<thead>' + obj.header.html()+ '</thead>');
	    cloneHead.attr("style", obj.headerStyle+";"+cloneHead.attr("style"));
            $.each(atributos, function () {
                if (this.name != "id") {
                    tabela.attr(this.name, this.value);
                }
            });
            tabela.append(cloneHead);

            obj.container.append(tabela);
            obj.container.width(obj.header.width()/(obj.widthRatio/100));
            obj.container.height(obj.header.height);
            obj.container.find('th').each(function (index) {
                var cellWidth = obj.grid.find('th').eq(index).width();
                $(this).css('width', cellWidth);
            });

            obj.container.css("visibility", "visible");

            if (params && params.height !== undefined) {
               
		if(params.offset !== undefined){
			obj.container.css("top", obj.scroller.offset().top + (params.offset.replace("px","") * 1) + "px");
		}
		else
		{
			obj.container.css("top", obj.scroller.offset().top + "px");
		}
				
                obj.container.css("position", "absolute");
				
            } else if (params && params.scrollListenerEl!== undefined) { 
                obj.container.css("top", obj.scroller.find("thead > tr").innerHeight() + "px");
                obj.container.css("position", "absolute");
                obj.container.css("z-index", "2");
			} else if (params && params.offset !== undefined) {
			    obj.container.css("top", params.offset);
                obj.container.css("position", "fixed");
            } else {
                obj.container.css("top", obj.fromTop);
                obj.container.css("position", "fixed");
            }
        }

        return this.each(function (i, e) {
            freezeHeader($(e));
        });

    };
})($vui);
