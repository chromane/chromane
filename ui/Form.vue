<script>
import Quill from "quill";

export default {
  components: {},
  props: ["model"],
  data() {
    return {
      clear_values: function () {
        this.model.form_item_model_arr.forEach((model) => {
          if (model.type === "text_input") {
            model.value = "";
            model.validity = "unknown";
          } else if (model.type === "password") {
            model.value = "";
            model.validity = "unknown";
          } else if (model.type === "html_editor") {
            console.log(model);

            model.quill.setContents([]);
            model.validity = "unknown";
          }
        });
      },

      item_model_input: (data, exec) => {
        exec(data.form_model.parent_module_name, "handle_item_model_input", data.form_model, data.form_item_model);
      },

      set_values: function (obj) {
        this.model.form_item_model_arr.forEach((model) => {
          if (model.type === "text_input") {
            model.value = obj[model.name];
          } else if (model.type === "html_editor") {
            model.element.querySelector(".ql-editor").innerHTML = obj[model.name];
          }
        });
      },

      set_value: function (name, value) {
        var form_item_model = window.common.find(this.model.form_item_model_arr, "name", name);
        if (form_item_model.type === "chromane_select") {
          // todo
          // exec("chromane_select", "select", form_item_model.chromane_select_model, value);
        } else {
          form_item_model.value = value;
        }
      },

      get_value: function (model) {
        if (model.type === "chromane_select") {
          // todo
          return null;
          // if (model.chromane_select_model.selected_option_data) {
          //   return model.chromane_select_model.selected_option_data.value;
          // } else {
          //   return null;
          // }
        } else {
          return model.value;
        }
      },

      get_obj: function () {
        var obj = {};

        this.model.form_item_model_arr.forEach((model) => {
          obj[model.name] = this.get_value(model);
        });

        return obj;
      },

      validate: function () {
        var form_is_valid = true;

        this.model.form_item_model_arr.forEach((item_model) => {
          item_model.validity = "valid";

          var value = this.get_value(item_model);

          if (item_model.required && !value) {
            item_model.validity = "invalid";
            item_model.message = "This field is required.";

            form_is_valid = false;
          }

          if (item_model.name === "password_confirm") {
            var pw_item = window.common.find(this.model.form_item_model_arr, "name", "password");
            var pw_value = this.get_value(pw_item);

            if (value !== pw_value) {
              item_model.validity = "invalid";
              item_model.message = "Passwords don't match.";

              form_is_valid = false;
            }
          }
        });

        return form_is_valid;
      },

      handle_chromane_select_change: function (model, option, exec) {
        var form_item_model = window.common.find(model.parent_model.form_item_model_arr, "name", model.name);
        form_item_model.value = form_item_model.chromane_select_model.selected_option_data.value;

        if (model.name === "current_user") {
          localStorage.current_user = option.value;
        }
      },
    };
  },
  mounted: function () {
    this.model.form_item_model_arr.forEach((item_model) => {
      if (item_model.type === "html_editor") {
        item_model.element = this.$el.querySelector(`.chromane_html_editor[data-name="${item_model.name}"]`);

        item_model.quill = new Quill(item_model.element, {
          modules: { toolbar: true },
          theme: "snow",
        });

        item_model.quill.on("text-change", function (delta) {
          item_model.value = item_model.element.querySelector(".ql-editor").innerHTML;
        });
      }
    });
  },
  methods: {},
};
</script>

<template>
  <div class="chromane_form">
    <div
      class="chromane_form_item"
      v-for="item_model in model.form_item_model_arr"
      v-bind:key="item_model.title"
    >
      <div
        class="chromane_form_item-title"
        v-text="item_model.title"
        v-if="item_model.type !== 'checkbox'"
      ></div>

      <!-- text_input -->

      <input
        v-if="item_model.type === 'text_input'"
        type="text"
        class="chromane_form_item-input"
        v-model="item_model.value"
      />

      <!-- password -->

      <input
        v-if="item_model.type === 'password'"
        type="password"
        class="chromane_form_item-input"
        v-model="item_model.value"
      />

      <!-- html_editor -->

      <div
        v-if="item_model.type === 'html_editor'"
        class="chromane_html_editor"
        v-bind:data-name="item_model.name"
        style="min-height: 120px"
      ></div>

      <!-- checkbox -->

      <label
        v-if="item_model.type === 'checkbox'"
        class="chromane_form_item-checkbox"
      >
        <input
          type="checkbox"
          v-model="item_model.value"
        />
        <span v-text="item_model.title"></span>
      </label>

      <div
        class="chromane_form_item-error_message"
        v-if="item_model.validity === 'invalid'"
        v-text="item_model.message"
      ></div>
    </div>
  </div>
</template>

<style>
/* chromane_form */

.chromane_form {
  width: 100%;
}

/* chromane_form_item */

.chromane_form_item {
  width: 100%;
  margin-bottom: 12px;
}

.chromane_form_item-title {
  margin-bottom: 4px;

  font-size: 11px;
  letter-spacing: 1px;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.6);
}

.chromane_form_item-input {
  width: 100%;
  height: 34px;

  border: 1px solid rgba(0, 0, 0, 0.24);
  border-radius: 4px;
  padding: 0px 12px;

  outline: none;
}

.chromane_form_item-error_message {
  width: 100%;
  margin-top: 4px;

  font-size: 13px;
  color: #dd0000;
}

/* chromane_form_item */

/**/
</style>
