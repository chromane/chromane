<script setup lang="ts">
import util from "@chromane/shared/ts/util";
import { onMounted, ref } from "vue";
const props = defineProps<{
  form_state: any;
  form_field: any;
}>();

let input_ref: any = ref(null);

function parse_google_address_components(address_components) {
  var ShouldBeComponent = {
    home: ["street_number"],
    postal_code: ["postal_code"],
    street: ["street_address", "route"],
    region: [
      "administrative_area_level_1",
      "administrative_area_level_2",
      "administrative_area_level_3",
      "administrative_area_level_4",
      "administrative_area_level_5",
    ],
    city: ["locality", "sublocality", "sublocality_level_1", "sublocality_level_2", "sublocality_level_3", "sublocality_level_4"],
    country: ["country"],
  };

  var address = {
    home: "",
    postal_code: "",
    street: "",
    region: "",
    city: "",
    country: "",
  };
  address_components.forEach((component) => {
    for (var shouldBe in ShouldBeComponent) {
      if (ShouldBeComponent[shouldBe].indexOf(component.types[0]) !== -1) {
        if (shouldBe === "country" || shouldBe === "region") {
          address[shouldBe] = component.short_name;
        } else {
          address[shouldBe] = component.long_name;
        }
      }
    }
  });
  return address;
}

onMounted(async () => {
  let input = input_ref.value;
  let w = window as any;
  while (true) {
    await util.wait(100);
    if (w.google) {
      break;
    }
  }
  let autocomplete = w.google.maps.places.Autocomplete;
  // Create the autocomplete object, restricting the search predictions to
  // addresses in the US
  autocomplete = new w.google.maps.places.Autocomplete(input, {
    componentRestrictions: { country: ["us"] },
    fields: ["address_components", "geometry"],
    types: ["address"],
  });
  // When the user selects an address from the drop-down, populate the
  // address fields in the form.
  autocomplete.addListener("place_changed", async () => {
    const place = autocomplete.getPlace();
    console.log("place", place);
    let result: any = parse_google_address_components(place.address_components);
    result.lat = place.geometry.location.lat();
    result.lng = place.geometry.location.lng();
    // result.location = place.geometry.location;
    props.form_state[props.form_field.name] = result;
    //
    console.log("result", result);
    // this.$emit("address_items_change", result);
    for (const component of place.address_components as google.maps.GeocoderAddressComponent[]) {
      console.log(component);
    }
    // await util.wait(100);
    // this.value = this.$refs.input.value;
    // this.$emit("change", this.$refs.input.value);
    // await util.wait(100);
    // this.value = this.$refs.input.value;
    // this.$emit("change", this.$refs.input.value);
    // await util.wait(100);
    // this.value = this.$refs.input.value;
    // this.$emit("change", this.$refs.input.value);
    // await util.wait(100);
    // this.value = this.$refs.input.value;
    // this.$emit("change", this.$refs.input.value);
    // this.value;
  });
});
</script>

<template>
  <input
    ref="input_ref"
    type="text"
    class="form-control"
    autocomplete="chrome-off"
  />
</template>

<style></style>
