import { Shopify } from "@shopify/shopify-api";
import { supabase } from "../helpers/supabaseAPI.js";

export function setupOrderPaidWebHook(path) {

  Shopify.Webhooks.Registry.addHandler("ORDERS_PAID", {
    path,
    webhookHandler: async (topic, shop, body) => {
      try {
        const payload = JSON.parse(body);

        console.log('note_attributes', payload?.note_attributes || []);

        const findAttributeValueByName = (name) => {
          return (payload?.note_attributes || []).find( attribute => attribute?.name === name )?.value;
        };

        const deliverySlotId = findAttributeValueByName('deliverySlotId');
        const collectionSlotId = findAttributeValueByName('collectionSlotId');

        console.log('deliverySlotId', deliverySlotId);
        console.log('collectionSlotId', collectionSlotId);

        if (deliverySlotId && collectionSlotId) {

          console.time('rpc');
          const { data: slotsDelivery, errorDelivery } = await supabase
          // .from('slots_delivery')
            .rpc('increment_current_orders_delivery', { x: 1, slot_id1: deliverySlotId })
          // .eq('slots_delivery', postal_code);

          const { data: slotsCollection, errorCollection } = await supabase
            .rpc('increment_current_orders_collection', { x: 1, slot_id1: collectionSlotId })

          console.timeEnd('rpc');
          console.log('slots updated!', errorDelivery, errorCollection);
        }

      } catch(err) {
        console.error('error in orderCreate webhook', err);
      }
    },
  });
}
