/**
 *  DynamoForm.js - A jquery based dynamic formset generator.
 *
 *  Author:     David Cramblett (dcramble@mesd.k12.or.us)
 *  License:    MIT
 */


$(document).ready(function() {

    /**
     * Add formset row activity
     *
     * Add new formset row when add button is clicked. A new row will be created
     * and all rows will be numerically re-indexed to ensure unique name and
     * id attribute when formset is processed server side.
     *
     */
    $('.dynamo-formset-row-add').click(function() {

        // Find the parent dynamo-formset
        var dynamoForm = $(this).closest('.dynamo-formset');

        // Determine if Max Rows is specified
        var maxRows = dynamoForm.attr('data-max-rows');
        if (undefined !== maxRows) {
            // Determine if Max Rows is exceeded and return false now if
            // yes. The add row button should be disabled if max rows has
            // been reached. This check is in here as a precaution.
            if (dynamoForm.find('.dynamo-formset-row').size() >= maxRows) {
                return false;
            }
        }

        // Find last row
        var lastRow = dynamoForm.find('.dynamo-formset-row').last();

        // Determine if select2 is in use and disable
        // for cloning purposes.
        var select2InUse    = false;
        var select2elements = [];
        lastRow.find('select').each(function() {
            var select2enabled = $(this).siblings('.select2-container');
            if (undefined !== select2enabled) {
                select2InUse = true;
                select2elements.push($(this).attr('id'));
                $(this).select2('destroy');
            }
        });

        // Clone last row
        lastRow.clone().insertAfter(lastRow);

        // Clear any data that was already entered in the copied row
        dynamoForm.find('.dynamo-formset-row').last().find( 'input,select,textarea' ).each(function() {
            $(this).val( '' );
            $(this).attr( 'checked', false );
        });

        //Re-enable any select2 fields if needed
        if (true === select2InUse) {
            $.each(select2elements, function(index, value) {
                lastRow.find('select#'+value).select2({width: '100%'});
                dynamoForm.find('.dynamo-formset-row').last().find('select#'+value).select2({width: '100%'});
            })
        }

        // Update the row numbering
        updateRowIndex( dynamoForm );


        // Determine if Max Rows is specified
        if (undefined !== maxRows) {
            // Determine if Max Rows has been met. If yes
            // remove add row button functionality.
            if (dynamoForm.find('.dynamo-formset-row').size() == maxRows) {
                dynamoForm.find('.dynamo-formset-row-add').addClass('disabled');
                dynamoForm.find('.dynamo-formset-row-add').attr('disabled', 'disabled');
            }
        }

        // Determine if Min Rows is specified
        var minRows = dynamoForm.attr('data-min-rows');
        if (undefined !== minRows) {
            // Determine if Min Rows has now been exceeded.
            // If yes, restore delete button functionality.
            if (dynamoForm.find('.dynamo-formset-row').size() > minRows) {
                dynamoForm.find('.dynamo-formset-row-delete').removeClass('disabled');
                dynamoForm.find('.dynamo-formset-row-delete').removeAttr('disabled');
            }
        }

        return false;
    });



     /**
     * Remove formset row activity
     *
     * Remove formset row when delete button is clicked. The specific row will be
     * deleted and all rows will be numerically re-indexed to ensure unique name
     * and id attribute when form is processed server side.
     *
     */
    $('.dynamo-formset').on('click', '.dynamo-formset-row-delete', function() {

        // Find the parent dynamo-formset
        var dynamoForm = $(this).closest('.dynamo-formset');

        // Determine if Min Rows is specified
        var minRows = dynamoForm.attr('data-min-rows');
        if (undefined !== minRows) {
            // Determine if Min Rows is met and return false now if
            // yes. The delete row buttons should be disabled if min rows
            // has been reached. This check is in here as a precaution.
            if (dynamoForm.find('.dynamo-formset-row').size() <= minRows) {
                return false;
            }
        }

        // Remove row
        $( this ).closest('.dynamo-formset-row').remove();

        // Update the row numbering
        updateRowIndex( dynamoForm );

        // Determine if Min Rows is specified
        if (undefined !== minRows) {
            // Determine if Min Rows has been met. If yes
            // remove delete row button functionality.
            if (dynamoForm.find('.dynamo-formset-row').size() == minRows) {
                dynamoForm.find('.dynamo-formset-row-delete').addClass('disabled');
                dynamoForm.find('.dynamo-formset-row-delete').attr('disabled', 'disabled');
            }
        }

        // Determine if Max Rows is specified
        var maxRows = dynamoForm.attr('data-max-rows');
        if (undefined !== maxRows) {
            // Determine if Max Rows has now been maintained.
            // If yes, restore add row button functionality.
            if (dynamoForm.find('.dynamo-formset-row').size() < maxRows) {
                dynamoForm.find('.dynamo-formset-row-add').removeClass('disabled');
                dynamoForm.find('.dynamo-formset-row-add').removeAttr('disabled');
            }
        }

        return false;
    });

});


/**
 * Re-index formset rows
 *
 * Update row indexing after a formset row has been added or deleted
 *
 */
function updateRowIndex(obj) {

    var index = 1;

    obj.find('.dynamo-formset-row').each( function() {

        var dynamoFormRow = $(this);

        dynamoFormRow.find('*').not('option').each( function() {

            // Re-index id attributes
            if ( undefined !== $(this).attr('id') ) {
                $(this).attr('id', reindexAttribute( $(this).attr('id'), index));
            }

            // Re-index name attributes
            if ( undefined !== $(this).attr('name') ) {
                $(this).attr('name', reindexAttribute($(this).attr('name'), index));
            }

            // Re-index label text if requested
            if ( 'true' == $(this).attr('data-dynamo-relabel') ) {
                $(this).text(reindexText($(this).text(), index));
            }
        });

        index++;
    });
}


/**
 * Re-index id and name attributes
 *
 * Check attribute for integer index pattern and update the attribute
 * when pattern is matched.
 */
function reindexAttribute(attribute, index) {
    attribute = attribute.replace(/\_\d+/, '_' + index);
    attribute = attribute.replace(/\d+]$/, index + ']');

    return attribute;
}


/**
 * Re-index element text
 *
 * Check element text for index pattern and update the text when
 * pattern is matched.
 */
function reindexText(text, index) {
    text = text.replace(/\ \d+$/, ' ' + index);

    return text;
}