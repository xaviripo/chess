# Chess

## Gameplay

By default, the only variation in comparison to normal chess is the fact that the king must be captured, like a normal piece, in order to win.

Each turn the player must:
1. buy from 0 to as many effects as they can afford; then
2. move a piece.

Moving a piece does not necessarily result in it ending up in the chosen square. By default, if the square is empty, and the move is legal, then it will
be moved there. When trying to capture an enemy piece, though, the movement will only be completed if the attacking piece has at least as many points as the defending piece. Otherwise, the defending piece will lose as many points as the attacking piece has, but neither piece will move.


### Stats

Each piece has the following stats:
- value in points,
- and effects (which can be temporary or permanent).


### Earning points

Each player can earn points in the following ways:

- by capturing an opponent's piece, the capturing player earns as many points as the captured piece is worth.
- when a player's turn begins, they receive as many points as the sum of their pieces' worth in points.


### Effects

At the beginning of each of their turns, the player can buy as many effects as they can afford.

Effects can affect either a piece of their own, an opponent's piece, or the game in general. Both players can see all the upgrades applied so far, by either of them.

Some effects have a lifetime limited by a number of turns or some specific condition. When the number of turns has passed or the condition is met, the upgrade disappears.

Some effects can also cause further upgrades to other pieces upon interaction.


## Protocol

The client and server exchange WebSocket messages, each with a *name* and a *payload*.


### Data

The general principle is to transmit only the changing information at each turn.

The global structure of the information is as follows:

```json
{
    "team": "white" | "black",
    "score": 0,
    "play": true | false,
    "pieces": {
        "<piece_id>": {
            "square": {
                "col": "a",
                "row": "1"
            },
            "team": "white" | "black",
            "rank": "king" | "queen" | "rook" | "bishop" | "knight" | "pawn",
        },
        ...
    },
    "effects" : {
        "<active_effect_id>": {
            "id": <effect_id>,
            "scope": <piece_id> | "white" | "black" | "all" | ...,
            "data": {
                ...
            }
        },
        ...
    },
    "shop": {
        "<effect_id>": {
            "name": "Name of the effect",
            "data": {
                ...
            }
        },
        ...
    }
}
```

On each message, the parts will only send the fields that have *changed*.

For example, upon moving a piece, a client might send a message like:

```json
{
    "pieces": {
        "a1b2c3d4": {
            "square": {
                "col": "a",
                "row": "2"
            }
        }
    }
}
```

Upon receiving this, the other party understands that the missing fields do not change.

Fields in dictionaries to be removed are marked by sending `null` in their place, for example the following would indicate that the piece moved in the previous example is now gone:

```json
{
    "pieces": {
        "a1b2c3d4": null
    }
}
```


### Server to client

#### `waiting`

Don't send anything.


#### `started`

Send the full global object with the appropriate initial values.


#### `bought`

Send the updated effects, whether on the `effects` list at the root or at the corresponding piece.


#### `not bought`

Don't send anything. Only for the client who tried to buy.


#### `moved`

Send the updated piece position and any updated stats and effects for any pieces.


#### `not moved`

Don't send anything. Only for the client who tried to move.


### Client to server

#### `connection`

Don't send anything.


#### `buy`

Send the desired effects to buy, whether on the `effects` list at the root or at the corresponding piece.


#### `move`

Send the desired move to make. No other pieces or stats are to be updated.