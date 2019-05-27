# -*- coding: utf-8 -*-

'''
    gvSIG Online.
    Copyright (C) 2010-2017 SCOLAB.

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
'''

'''
@author: jrodrigo <jrodrigo@scolab.es>
'''


from django.shortcuts import render_to_response, RequestContext, redirect, HttpResponse
from django.http import HttpResponseRedirect, HttpResponseBadRequest, HttpResponseNotFound, HttpResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods, require_safe,require_POST, require_GET
from django.shortcuts import render
import json
import ast
from django.views.decorators.csrf import csrf_exempt
from service import geonetwork_service
from gvsigol_services.models import Layer
from gvsigol_plugin_catalog.models import LayerMetadata
from gvsigol_auth.utils import staff_required
from django.http import JsonResponse
import logging
from gvsigol_plugin_catalog import settings as catalog_settings

logger = logging.getLogger("gvsigol")

def get_query(request):
    if geonetwork_service!=None and request.method == 'GET':
        try:
            parameters = request.GET
            
            query = ''
            for key in parameters:
                query += key+'='
                for item in parameters.get(key):
                    query+=item
                query += '&'
            
            response = geonetwork_service.get_query(query)
            aux_response = json.loads(response)
            return HttpResponse(response, content_type='text/plain')
        except Exception as e:
            return HttpResponse(status=500, content=e.message)
        
    return HttpResponse(status=500)

def get_metadata_id(request, layer_ws, layer_name):
    logger.debug('get_metadata_id: '+layer_ws+":"+layer_name)
    response = {}
    response['success'] = False
    
    try:
        if request.method == 'GET':
            layers = Layer.objects.filter(name=layer_name)
            for layer in layers:
                if layer.datastore.workspace.name == layer_ws:
                    layerMetadata = LayerMetadata.objects.filter(layer=layer)
                    if layerMetadata and layerMetadata[0].metadata_uuid != None and layerMetadata[0].metadata_uuid != '':
                        md_response = geonetwork_service.get_metadata(layerMetadata[0].metadata_uuid)
                        if isinstance(md_response, dict):
                            response = md_response
                            response['success'] = True
                            response['html']= get_metadata_as_html(response)
                        else:
                            logger.debug(type(response))
    except Exception as e:
        logger.exception(e)
    return HttpResponse(json.dumps(response), content_type='application/json')

@login_required(login_url='/gvsigonline/auth/login_user/')
@staff_required
@require_http_methods(["POST"])
def create_metadata(request, layer_id):
    if request.method == 'POST':
        try:
            layer = Layer.objects.get(id=int(layer_id))
            uuid, the_id = geonetwork_service.metadata_insert(layer)
            lm = LayerMetadata()
            lm.layer = layer
            lm.metadata_id = the_id
            lm.metadata_uuid = uuid
            lm.save()
            return JsonResponse({'status': 'ok', 'uuid': uuid, 'id': the_id})
        except Exception as e:
            logger.exception(e)
            return HttpResponse(status=500, content=e.message)

def get_metadata_as_html(response):
    try:
        if response:
            #http://localhost/gvsigonline/catalog/get_metadata/<metadata_id>/?getPanel=true
            html = '<div class="row" style="padding: 20px;">'
            html += '    <div class="col-md-8">'
            html += '        <h4 class="modal-catalog-title" style="font-weight:bold">'+response.get('title', '')+'</h4>'
            html += '        <p>'+response.get('abstract', '')+'</p>'
             
            if len(response['categories'])>0:
                html += '        <span class="catalog_detail_attr">'+'Categories'+':</span>'
                categories = ", ".join(response['categories'])             
                html += '        '+ categories
                html += '        <br />'
        
            if len(response['keywords'])>0:
                html += '        <span class="catalog_detail_attr">'+'Keywords'+':</span>'
                keywords = [ '<span class="badge">' + kw + '</span>' for kw in response['keywords']]
                keywords = ' '.join(keywords)
                html += '        '+ keywords
                html += '        <br />'

            contactsHtml = ''
            for contact in response['contacts']['resource_contacts']:
                if contact.get('organisation'):
                    if contact.get('onlineResource') and contact.get('onlineResource').get('url'):
                        onlineResourceHtml = '&nbsp;&nbsp;<a href="'+contact.get('onlineResource').get('url')+'" target="_blank" class="fa fa-external-link"> ' + contact.get('onlineResource').get('name') + '</a>'
                    else:
                        onlineResourceHtml = ''
                    contactsHtml += '<p><span class="catalog_detail_attr">'+contact.get('role', 'Contact')+": </span>"+contact.get('organisation')+onlineResourceHtml+'</p>'
            if contactsHtml != '':
                html += '        <h4 class="modal-catalog-title">'+'Resource Contacts'+'</h4>'
                html += contactsHtml
            contactsHtml = ''
            for contact in response['contacts']['metadata_contacts']:
                if contact.get('organisation'):
                    if contact.get('onlineResource') and contact.get('onlineResource').get('url'):
                        onlineResourceHtml = '&nbsp;&nbsp;<a href="'+contact.get('onlineResource').get('url')+'" target="_blank" class="fa fa-external-link"> ' + contact.get('onlineResource').get('name') + '</a>'
                    else:
                        onlineResourceHtml = ''
                    contactsHtml += '<p><span class="catalog_detail_attr">'+contact.get('role', 'Contact')+": </span>"+contact.get('organisation')+onlineResourceHtml+'</p>'
            if contactsHtml != '':
                html += '        <h4 class="modal-catalog-title">'+'Metadata Contacts'+'</h4>'
                html += contactsHtml
            
            resConstraints = ''
            for useLimitation in response['resource_constraints']['useLimitations']:
                if useLimitation:
                    resConstraints += '        <span class="catalog_detail_attr">Use limitation: </span>'+useLimitation+'<br>'
            for accessConstraint in response['resource_constraints']['accessConstraints']:
                if accessConstraint:
                    resConstraints += '        <span class="catalog_detail_attr">Access constraint: </span>'+accessConstraint+'<br>'
            for useConstraint in response['resource_constraints']['useConstraints']:
                if useConstraint:
                    resConstraints += '        <span class="catalog_detail_attr">Use constraint type: </span>'+useConstraint+'<br>'
            for otherConstraint in response['resource_constraints']['otherConstraints']:
                if otherConstraint:
                    resConstraints += '        <span class="catalog_detail_attr">Constraint description: </span>'+otherConstraint+'<br>'
            if resConstraints != '':
                html += '        <h4 class="modal-catalog-title">'+'Resource constraints'+'</h4>'
                html += resConstraints
         
            html += '        <h4 class="modal-catalog-title">'+'Technical information'+'</h4>'
            
            if response.get('representation_type', None):
                html += '        <span class="catalog_detail_attr">'+'Representation type'+':</span>'
                html += '        '+response['representation_type']
                html += '        <br />'
            
            if response.get('scale', None):
                html += '        <span class="catalog_detail_attr">'+'Scale'+':</span>'
                html += '        1:'+response['scale']
                html += '        <br />'
            
            if response.get('srs', None):
                html += '        <span class="catalog_detail_attr">'+'Coordinate Reference System'+':</span>'
                html += '        '+response['srs']
                html += '        <br />'
            #https://gvsigol.localhost/geonetwork/srv/eng/catalog.search#/metadata/8dd47e35-2895-40df-9bf5-4f43d4257bb2
            
            if response.get('metadata_id', None):
                gn_md_url = catalog_settings.CATALOG_BASE_URL + "/srv/eng/catalog.search#metadata/" + response.get('metadata_id', '')
                html += '        <span class="catalog_detail_attr">'+'Metadata identifier'+':</span>'
                html += '        '+response.get('metadata_id', '')
                html += '        &nbsp;&nbsp;<a class="fa fa-external-link" target="_blank" href="' + gn_md_url + '">'+' Show in Catalog'+'</a>'
                html += '        <br />'
            # online services
            ogcservices_html = ''
            for resource in response['resources']:
                default_key = 'name'
                if not resource[default_key]:
                    default_key = 'descriptions'
                if resource.get('url'):
                    if "OGC:WMS" in resource['protocol']:
                        ogcservices_html += '            WMS: '
                        ogcservices_html += '('+ str(resource[default_key])+')'
                        ogcservices_html += '                <span>'+resource['url']+'?service=WMS&request=GetCapabilities>'
                    elif "OGC:WFS" in resource['protocol']:
                        ogcservices_html += '            WFS: '
                        ogcservices_html += '('+ str(resource[default_key])+')'
                        ogcservices_html += '                <span>'+resource['url']+'?service=WFS&request=GetCapabilities>'
                    elif "OGC:WCS" in resource['protocol']:
                        ogcservices_html += '            WCS: '
                        ogcservices_html += '('+ str(resource[default_key])+')'
                        ogcservices_html += '                <span>WCS: '+resource['url']+'?service=WCS&request=GetCapabilities>'
                    ogcservices_html += '            <div style="clear:both"></div>'
            if ogcservices_html != '':
                html += '        <h4 class="modal-catalog-title">'+'Online services'+'</h4>'
                html += ogcservices_html
                     
            html += '    </div>'
            
            html += '    <div class="col-md-4" style="border: 1px solid #ddd; border-radius: 4px; padding: 20px;">'
            if len(response['thumbnails']) > 0:
                html += '<h4 class="modal-catalog-title">'+'Overview'+'</h4>' 
                for thumbnail in response['thumbnails']:
                    html += '            <img src="'+thumbnail['url']+'" alt="'+thumbnail['name']+'" style="width:100%"/><br />'
            html += '        <h4 class="modal-catalog-title">'+'Download and links'+'</h4>'
            resources = ""
            if len(response['resources']) > 0: 
                for resource in response['resources']:
                    if resource.get('name'):
                        res_desc = resource.get('name')
                    else:
                        res_desc = resource.get('descriptions', 'Resource')
                    default_key = 'name'
                    if not resource[default_key]:
                        default_key = 'descriptions'
                    if resource.get('url'):
                        if resource['protocol'] == 'WWW:DOWNLOAD-1.0-http--download':
                            resources += '            '+ str(res_desc)
                            resources += '                <a href="'+resource['url']+'" target="_blank" style="float:right; background-color:#ddd; padding:5px; width:75px">Download</a>'
                        elif "OGC:WFS" in resource['protocol']:
                            resources += '            '+ str(res_desc)
                            resources += '                <a href="'+resource['url']+'?service=WFS&version=1.0.0&request=GetFeature&typeName='+str(resource['name'])+'&outputFormat=SHAPE-ZIP" target="_blank" style="float:right; background-color:#ddd; padding:5px; width:75px">Get shape</a>'
                        elif not 'OGC:' in resource['protocol']:
                            resources += '            '+ str(res_desc)
                            resources += '                <a href="'+resource['url']+'" target="_blank" style="float:right; background-color:#ddd; padding:5px; width:75px">Download</a>'
                        #resources += '            <div style="clear:both"></div>'
            if resources == "":
                resources += '<p>'+'No resources available'+'</p>'
            html += resources
            html += '            <div style="clear:both"></div>'
            
            html += '        <h4 class="modal-catalog-title">'+'Spatial Extent'+'</h4>'
            html += '        <img class="gn-img-thumbnail img-thumbnail gn-img-extent" data-ng-src="'+response['image_url']+'" src="'+response['image_url']+'" style="width:100%"/>'
            
            temporal_extent_html = ''
            if response.get('publish_date'):
                temporal_extent_html += '        <span class="catalog_detail_attr">'+'Publication date'+':</span>'
                temporal_extent_html += '        '+response.get('publish_date')
                temporal_extent_html += '        <br />'
            
            if response.get('period_start'):
                temporal_extent_html += '        <span class="catalog_detail_attr">'+'Period'+':</span>'
                temporal_extent_html += '        '+response['period_start']+' - '+response.get('period_end', '')
                temporal_extent_html += '        <br />'
            if temporal_extent_html != '':
                html += '        <br /><br /><h4 class="modal-catalog-title">'+'Temporal Extent'+'</h4>'
                html += temporal_extent_html
                     
            html += '    </div>'
            html += '</div>'
             
            return html     
    except Exception as e:
        logger.exception(e)
        #print e
        
    html = '<div class="row" style="padding: 20px;">'
    html += '    <div class="col-md-8">'
    html += '        <h4 class="modal-catalog-title" style="font-weight:bold">Metadata detail not available</h4>'
    html += '    </div>'
    html += '</div>'
    return html

def get_metadata(request, metadata_uuid):
    # FIXME: we should only query using admin user if the user is admin or staff
    if geonetwork_service!=None and request.method == 'GET':
        try:
            parameters = request.GET
            if 'sharing' in parameters:
                sharing = True
            else:
                sharing = False
            
            if not sharing:
                metadataJsonSummary = geonetwork_service.get_metadata(metadata_uuid)
                response = {
                    'html': get_metadata_as_html(metadataJsonSummary)
                }
                return  HttpResponse(json.dumps(response, indent=4), content_type='application/json')
            else:
                # FIXME
                #http://localhost/gvsigonline/catalog/get_metadata/<metadata_id>/
                return render_to_response('catalog_details.html', response, context_instance=RequestContext(request))
            
        except Exception as e:
            logger.exception(e)
            return HttpResponse(status=500, content=e.message)
        
    return HttpResponse(status=500)

