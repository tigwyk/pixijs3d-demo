# The Ship stays at the origin; the Grid moves around it

The player can leave a Grid on engines and drift indefinitely, so a Ship that moved through world space would eventually sit far enough from the origin for 32-bit float precision to make it jitter, and the orbit camera's target would have to chase it every frame. We keep the Ship fixed at the scene origin and translate the Grid's contents by the inverse of the Ship's motion instead. The Ship's position within a Grid is therefore a number we track ourselves, not a transform on the Ship node.

## Considered Options

- **Move the Ship, re-centre periodically.** The obvious layout, but it needs a threshold, a re-centre step that touches every node at once, and a camera target that follows a moving object.
- **Wall off the Grid.** Removes the precision problem by bounding travel, but unbounded drift is the Demo's purest "cold and empty" moment and was explicitly kept.

## Consequences

- Anything placed in a Grid must be a child of the Grid's container, never of the scene root, or it will not move with the Grid.
- The Backdrop is unaffected: it is infinitely distant and only responds to camera rotation.
- Engine-trail particles must be emitted into the Grid's space, not the Ship's, or the trail will not stream behind the Ship.
