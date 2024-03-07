# ngx-aside-ease

# Description

ngx-aside-ease is an Angular library that offers a lightweight, performant, and responsive aside panel. This library has multiple options and offers a good user experience.

Support Angular version starts at v17.

# Demo

Live demonstration of the ngx-aside-ease library [here](https://greenflag31.github.io/aside-library/ngx-aside-ease).

# Installation

You can install the library using the following command:

```
npm i ngx-aside-ease
```

Import the stylesheet in your `styles.css`:
`@import "../node_modules/ngx-aside-ease/src/lib/aside/aside.css";`

Add the `AsideModule` to your module or standalone component.

# Usage

This library contains two components and directives to add in the template:

```html
<ngx-aside-container>
  <ngx-aside>
    <h3 ngxTitle>ngx-aside-ease</h3>
    <div ngxCategory>
      <p>general</p>
      <i class="..."></i>
    </div>
    <div ngxCategory>
      <p>preferences</p>
      <i class="..."></i>
    </div>
    <div ngxCategory>
      <p>performant</p>
      <i class="..."></i>
    </div>
    <div ngxCategory [defaultActive]="true">
      <p>responsive</p>
      <i class="..."></i>
    </div>
    <div ngxCategory>
      <p>controlable</p>
      <i class="..."></i>
    </div>
  </ngx-aside>

  <!-- HERE THE CONTENT OF THE PAGE -->
  <section class="content-page">
    <!-- ... -->
  </section>
</ngx-aside-container>
```

The components contain following options:

| Selector            | Option                 | Default       | Description                                                                       |
| ------------------- | ---------------------- | ------------- | --------------------------------------------------------------------------------- |
| ngx-aside-container | reverse                | false         | Reverse the panel, setting it on the right of the page.                           |
| ngx-aside           | minVisible             | 30            | The minimum visible panel width in pixels, triggered by a method (not manually).  |
| ngx-aside           | minWidth               | 250           | The minimum panel width in pixels by dragging (Mouse or Touch event).             |
| ngx-aside           | width                  | 300           | The width of the panel in pixels.                                                 |
| ngx-aside           | maxWidth               | 50            | The maximum width of the panel in viewport width (vw).                            |
| ngx-aside           | responsiveBreakpoint   | 800           | The responsive breakpoint in pixels under which the responsive mode is triggered. |
| ngx-aside           | displayCollapsableIcon | true          | Display the icon to collapse the panel.                                           |
| ngx-aside           | asideAnimationTiming   | 0.3s ease-out | The panel animation shorthand CSS.                                                |
| ngx-aside           | enableResize           | true          | Enable manual resize of the panel.                                                |
| ngx-aside           | resizerColor           | #0095be       | Define the color of the resizer on hover.                                         |
| ngx-aside           | enableMarker           | true          | Enable the marker on the active element.                                          |
| ngx-aside           | markerColor            | gold          | Define the color of the marker.                                                   |
| ngx-aside           | markerAnimationTiming  | 0.3s ease-out | The marker animation shorthand CSS.                                               |
| ngx-aside           | storePreference        | true          | Store the resize preference of the user in localStorage.                          |
| ngx-aside           | updateUrl              | true          | Update the URL with the active selection.                                         |
| ngx-aside           | paramUrlName           | name          | Set the name of the parameter in the URL. Example: ?name=selection.               |

The ngxTitle directive is to place on your title (if any) and ngxCategory directive on your items.

| Directive | Option        | Default | Description                  |
| --------- | ------------- | ------- | ---------------------------- |
| ngxTitle  | defaultActive | false   | Set the default active item. |
| ngxTitle  | disable       | false   | Disable the item.            |

# AsideService

This library exposes an `AsideService` which contains following method/property:

```javascript
// toggle panel visibility, partially or totally*
this.asideService.toggleVisibility();

// RxJs Subject triggered on selection change
onSelectionChange = new Subject<HTMLElement>();

// Usage
this.asideService.onSelectionChange.subscribe((item) => {
  // returns the item that has been selected
});
```

\*The panel will either open partially or totally, depending on the responsive breakpoint set. The responsive breakpoint is set to 800px by default. Under 800px, triggering this method will either totally display/hide the panel. Above this threshold, the panel will be partially opened/hidden.

# Responsive

This library is responsive and will automatically hide/display the panel according to the option `responsiveBreakpoint`.

# Style customisation

If you want to override any default styles, add `ViewEncapsulation.None` to the hosting component and override existing classes (inspect the DOM to find the corresponding classes). This library automatically adds an styleless `active` class on the active element, so you can style the active element in your hosting component.

Following modifies the background and the color of the aside panel:

```css
.ngx-aside-wrapper {
  background: linear-gradient(to bottom, rgb(0, 0, 155), #000311);
  color: #fff;
}
```

Classes have been prefixed with `ngx-*`.

# Change log

# Report a Bug

Please provide a detailed description of the encountered bug, including your options and the steps/actions that led to the issue. An accurate description will help me to reproduce the issue.

# Ngx-ease serie

You like this library? Discover the ngx-ease serie [here](https://www.npmjs.com/~greenflag31).
