/**
 * gvSIG Online.
 * Copyright (C) 2010-2017 SCOLAB.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @author: José Badía <jbadia@scolab.es>
 */

/**
 * TODO
 */
var catalog = function(map, conf) {
	this.map = $("#container");	
	this.conf = conf;
	this.catalog_panel = null;
	this.catalog_map = null;
	this.initialization();
};

catalog.prototype.initialization = function(){
	var self = this;
	var filters = this.getCatalogFilters("");
	
	var catalogPanel = '';
	catalogPanel += '<div id="catalog_container">';

	catalogPanel += '<div id="catalog_search_full" class="row">';
	catalogPanel += '<div id="catalog_map_search" class="col-md-3">';
	catalogPanel += '<div id="catalog_map_full">';
	catalogPanel += '<div id="catalog_map" class="catalog_map"></div>';
	catalogPanel += '<p class="catalog_map_text">Presiona Ctrl para marcar un área&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a id="catalog_map_clean" href="#">Limpiar</a></p>';
	catalogPanel += '</div>';
	catalogPanel += '</div>';
	catalogPanel += '<div id="catalog_search" class="col-md-9">';
	catalogPanel += '	<div class="row">';
	catalogPanel += '		<div class="col-md-offset-1 col-md-10 relative">';
	catalogPanel += '    		<div class="input-group gn-form-any">';
	catalogPanel += '				<input type="text" class="form-control input-lg ng-pristine ng-untouched ng-valid ng-empty" id="gn-any-field" placeholder="Buscar..." data-ng-keyup="$event.keyCode == 13 &amp;&amp; triggerSearch()" data-typeahead="address for address in getAnySuggestions($viewValue)" data-typeahead-loading="anyLoading" data-typeahead-min-length="1" data-typeahead-focus-first="false" data-typeahead-wait-ms="300" aria-autocomplete="list" aria-expanded="false" aria-owns="typeahead-310-2994">';

	catalogPanel += '				<div class="input-group-btn">';
	catalogPanel += '					<button id="catalog-search-advanced-button" type="button" class="btn btn-default btn-lg ng-pristine ng-untouched ng-valid ng-not-empty" data-ng-model="searchObj.advancedMode" btn-checkbox="" btn-checkbox-true="1" btn-checkbox-false="0">';
	catalogPanel += '						<i class="fa fa-ellipsis-v"></i>';
	catalogPanel += '					</button>';

	catalogPanel += '					<button id="catalog-search-button" type="button" class="btn btn-primary btn-lg">';
	catalogPanel += '						&nbsp;&nbsp;';
	catalogPanel += '						<i class="fa fa-search"></i>';
	catalogPanel += '             			&nbsp;&nbsp;';
	catalogPanel += '					</button>';
	catalogPanel += '					<button id="catalog-clear-button" type="button" title="Limpiar búsqueda actual, filtros y orden." class="btn btn-link btn-lg">';
	catalogPanel += '						<i class="fa fa-times"></i>';
	catalogPanel += '					</button>';
	catalogPanel += '				</div>';
	catalogPanel += '			</div>';
	catalogPanel += '		</div>';
	catalogPanel += '		<div class="col-lg-3">';
	catalogPanel += '		</div>';
	catalogPanel += '	</div>';
	catalogPanel += '</div>';
	catalogPanel += '	<div id="catalog_search_advanced" class="row">';
	catalogPanel += '		<div class="catalog_search_advanced_col col-md-4">';
	catalogPanel += '	    	<h3 data-translate="" class="ng-scope">¿Qué?</h3>';
	catalogPanel += '			<div class="form-group">';
	catalogPanel += '	        	<label for="categoriesF" class="col-md-4 col-sm-12 control-label ng-scope">Categorías</label>';
	catalogPanel += '				<div class="col-sm-8">';
	catalogPanel += '					<input type="text" id="categoriesF" placeHolder="Separado por \';\'    P.ej: cat_1;cat_2;..." value="" class="form-control ng-isolate-scope"/>';
	catalogPanel += '   			</div>';
	catalogPanel += '   		</div>';
	catalogPanel += '			<div class="form-group">';
	catalogPanel += '				<label for="keywordsF" class="col-md-4 col-sm-12 control-label ng-scope">Palabras Clave</label>';
	catalogPanel += '				<div class="col-sm-8">';
	catalogPanel += '       			<input type="text" id="keywordsF" placeHolder="Separado por \';\'    P.ej: cat_1;cat_2;..." value="" class="form-control ng-isolate-scope"/>';
	catalogPanel += '       		 </div>';
	catalogPanel += '	      	</div>';
	catalogPanel += '      		<div class="form-group">';
	catalogPanel += '  				<label for="orgNameF" class="col-md-4 col-sm-12 control-label ng-scope">Contacto para el recurso</label>';
	catalogPanel += '   			<div class="col-sm-8">';
	catalogPanel += ' 			        <input type="text" id="orgNameF" placeHolder="Separado por \';\'    P.ej: cat_1;cat_2;..." value="" class="form-control ng-isolate-scope"/>';
	catalogPanel += '   		    </div>';
	catalogPanel += '   		</div>';
	catalogPanel += ' 		</div>';
	catalogPanel += '    	<div class="catalog_search_advanced_col col-md-4">';
	catalogPanel += '     		<h3 class="ng-scope">¿Cuándo?</h3>';
	catalogPanel += '        <div data-gn-period-chooser="resourcesCreatedTheLast" data-date-from="searchObj.params.creationDateFrom" data-date-to="searchObj.params.creationDateTo" class="ng-isolate-scope">';
	catalogPanel += '		<div class="btn-group btn-group-xs">';
	catalogPanel += '      			<span data-translate="" class="ng-scope ng-binding"><strong>Recursos</strong>';
	catalogPanel += ' 		</div>';
	catalogPanel += ' 		<br>';
	catalogPanel += '  		<div class="row">';
	catalogPanel += '    			<div class="col-md-6">';
	catalogPanel += '        			<input id="catalog_resource_from" placeholder="De..." data-provide="datepicker" class="form-control" data-date-format="yyyy-mm-dd" value="">';
	catalogPanel += '    			</div>';
	catalogPanel += '    			<div class="col-md-6">';
	catalogPanel += '        			<input id="catalog_resource_to" placeholder="Hasta..." data-provide="datepicker" class="form-control" data-date-format="yyyy-mm-dd" value="">';
	catalogPanel += '    			</div>';
	catalogPanel += '  		</div>';
	catalogPanel += '		<div class="btn-group btn-group-xs">';
	catalogPanel += '      			<span data-translate="" class="ng-scope ng-binding"><strong>Registros</strong>';
	catalogPanel += ' 		</div>';
	catalogPanel += ' 		<br>';
	catalogPanel += '  		<div class="row">';
	catalogPanel += '    			<div class="col-md-6">';
	catalogPanel += '        			<input id="catalog_register_from" placeholder="De..." data-provide="datepicker" class="form-control" data-date-format="yyyy-mm-dd" value="">';
	catalogPanel += '    			</div>';
	catalogPanel += '    			<div class="col-md-6">';
	catalogPanel += '      				<input id="catalog_register_to" placeholder="Hasta..." data-provide="datepicker" class="form-control" data-date-format="yyyy-mm-dd" value="">';
	catalogPanel += '    			</div>';
	catalogPanel += '  		</div>';
	catalogPanel += '	   </div>';
	catalogPanel += '	   </div>';
	catalogPanel += '</div>';
	catalogPanel += '</div>';

	
	catalogPanel += '<div class="col-md-3" id="catalog_filter">';
	catalogPanel += '</div>';
	
	catalogPanel += '<div class="col-md-9" id="catalog_content">';
	catalogPanel += '</div>';
	
	
	catalogPanel += '</div>';
	$("body").append(catalogPanel);
	
	this.catalog_panel = $("#catalog_container");
	
	
	$("#catalog-search-button").unbind("click").click(function(){
		self.filterCatalog();
	});
	
	$("#catalog-search-advanced-button").unbind("click").click(function(){
		$("#catalog_search_advanced").toggle();
		$("#catalog_map_full").toggle(); 
	});
	
	$("#catalog-clear-button").unbind("click").click(function(){
		$("#gn-any-field").val("");
		$("#categoriesF").val("");
		$("#keywordsF").val("");
		$("#orgNameF").val("");
		$("#catalog_resource_from").val("");
		$("#catalog_resource_to").val("");
		$("#catalog_register_from").val("");
		$("#catalog_register_to").val("");
		self.catalog_map.cleanData();
		self.launchQuery();
	});
	
	$("#catalog_map_clean").unbind("click").click(function(){
		self.catalog_map.cleanData();
		self.filterCatalog();
	});
}

catalog.prototype.filterCatalog = function(){
	var search = $("#gn-any-field").val();
	var categories = $("#categoriesF").val();
	var keywords = $("#keywordsF").val();
	var resources = $("#orgNameF").val();
	var creation_from = $("#catalog_resource_from").val();
	var creation_to = $("#catalog_resource_to").val();
	var date_from = $("#catalog_register_from").val();
	var date_to = $("#catalog_register_to").val();
	var extent = this.catalog_map.getSelectedArea();
	this.launchQuery(search, categories, keywords, resources, creation_from, creation_to, date_from, date_to, extent);

}

catalog.prototype.launchQuery = function(search, categories, keywords, resources, creation_from, creation_to, date_from, date_to, extent){
	var query = "";
	var is_first = true;
	$(".catalog_filter_entry_ck").each(function(){
		if($(this).is(':checked')){
			if(!is_first){
				query += "%26";
			}
			query += $(this).attr("name");
			is_first = false;
		}
		
	});
	this.getCatalogFilters(query, search, categories, keywords, resources, creation_from, creation_to, date_from, date_to, extent);
}

catalog.prototype.getCatalogEntry = function(query, cat, entry){
	var entry_name = cat['@name'] + '%2F' + entry['@value'];
	var checked = "";
	var selected = "";
	if(query.includes(entry_name)){
		checked = " checked";
		selected = " catalog_filter_entry_ck_sel"
	}

	return '<li class="catalog_filter_entry' + selected + '"><input ' + checked + ' type="checkbox" class="catalog_filter_entry_ck" name="'+ entry_name + '"/>&nbsp;&nbsp;&nbsp;'+ entry['@label'] + ' (' + entry['@count'] +')</li>';
}

catalog.prototype.getMetadataEntry = function(metadata){
	var met = '';
	if(metadata){
		met += '<div class="catalog_content_layer col-md-6">';
		met += '	<div class="col-md-9">';
		met += '		<p class="catalog_content_title block-with-text">'+ metadata['defaultTitle'] +'</p>';
		met += '		<p class="catalog_content_abstract block-with-text">'+ metadata['abstract'] +'</p>';
		met += '	</div>';
		met += '	<div class="col-md-3 catalog_content_lateral">';
		met += '		<div class="catalog_content_thumbnail"></div>';
		met += '	</div>';
		met += '	<div class="col-md-12">';
		met += '			<div class="catalog_content_button_place col-md-4"><div class="catalog_content_button">Details</div></div>';
		met += '			<div class="catalog_content_button_place col-md-4"><div class="catalog_content_button">Map</div></div>';
		met += '			<div class="catalog_content_button_place col-md-4"><div class="catalog_content_button">Download</div></div>';
		met += '	</div>';
		met += '</div>';
	}else{
		met += '<div class="no_catalog_content col-md-12">';
		met += '<i class="fa fa-ban" aria-hidden="true"></i>   ';
		met += 'No se encontraron resultados';
		met += '</div>';
	}
	return met;
}

catalog.prototype.getKeywordQuery = function(keywords, key){
	var cat_array = keywords.split(";");
	var cats = "";
	for(var i=0; i<cat_array.length; i++){
		if(i==0){
			cats += "&"+key+"=";
		}else{
			cats += " or ";
		}
		cats += cat_array[i];
	}
	cats = cats.replace(new RegExp(' ', 'g'), '+');
	return cats;
}

catalog.prototype.getCatalogFilters = function(query, search, categories, keywords, resources, creation_from, creation_to, date_from, date_to, extent){
	var self = this;
	var filters = ""
	if(search && search.length > 0){
		filters += "&any="+search;
	}
	if(resources && resources.length > 0){
		filters += this.getKeywordQuery(resources, "orgName");
	}
	if(keywords && keywords.length > 0){
		filters += this.getKeywordQuery(keywords, "keyword");
	}
	if(categories && categories.length > 0){
		filters += this.getKeywordQuery(categories, "_cat");
	}
	if(creation_from && creation_from.length > 0){
		filters += "&creationDateFrom="+creation_from;
	}
	if(creation_to && creation_to.length > 0){
		filters += "&creationDateTo="+creation_to;
	}
	if(date_from && date_from.length > 0){
		filters += "&dateFrom="+date_from;
	}
	if(date_to && date_to.length > 0){
		filters += "&dateTo="+date_to;
	}
	if(extent && extent.length > 0){
		filters += "&geometry="+extent;
	}
	
	var url = 'http://localhost:8080/geonetwork/srv/spa/q?_content_type=json'+filters+'&bucket=s101&facet.q='+query+'&fast=index&resultType=details&sortBy=relevance';
	$.ajax({
		url: url,
		success: function(response) {
			try{
				console.log(response);
				
				var filter_code = '';
				for(var idx = 0; idx < response.summary.dimension.length; idx++){
					var cat = response.summary.dimension[idx];
					if('category' in cat && Array.isArray(cat.category) && cat.category.length > 0){
						filter_code += '<ul class="catalog_filter_cat"><p class="catalog_filter_title">'+ cat['@label'] +'</p>';
						for(var idx2 = 0; idx2 < cat.category.length; idx2++){
							var entry = cat.category[idx2];
							filter_code += self.getCatalogEntry(query, cat, entry);
						}
						filter_code += '</ul>';
					}
					if('category' in cat && '@value' in cat.category){
						filter_code += '<ul class="catalog_filter_cat"><p class="catalog_filter_title">'+ cat['@label'] +'</p>';
						var entry = cat.category;
						filter_code += self.getCatalogEntry(query, cat, entry);
						filter_code += '</ul>';
					}
					
				}
				$("#catalog_filter").html(filter_code);
				
				
				var content_code = '';
				if(Array.isArray(response.metadata)){
					for(var idx = 0; idx < response.metadata.length; idx++){
						var metadata = response.metadata[idx];
						content_code += self.getMetadataEntry(metadata);
					}
				}else{
					var metadata = response.metadata;
					content_code += self.getMetadataEntry(metadata);
				}
				$("#catalog_content").html(content_code);
				
				
				$(".catalog_filter_entry_ck").unbind("click").click(function(){
					var search = $("#gn-any-field").val();
					var categories = $("#categoriesF").val();
					var keywords = $("#keywordsF").val();
					var resources = $("#orgNameF").val();
					self.launchQuery(search, categories, keywords, resources);
				})
				
			} catch (e) {
				console.log(e);
			}
		},
		error: function(jqXHR, textStatus) {
			console.log(textStatus);
		}
	});
}

catalog.prototype.showPanel = function(){
	this.catalog_panel.show();
	this.map.hide();
	if(!this.catalog_map){
		this.catalog_map = new CatalogMap(this, "catalog_map");
	}
}

catalog.prototype.hidePanel = function(){
	this.map.show();
	this.catalog_panel.hide();
}
