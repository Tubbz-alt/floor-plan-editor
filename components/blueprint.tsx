import { observer } from "mobx-react";
import { useObservable } from "mobx-react-lite";
import React, { memo, useEffect, useRef, useCallback } from "react";
import { useInstance } from "react-ioc";
import Sidebar from "react-sidebar";
import { Blueprint } from "../models/blueprint";
import { ItemArray, ItemNameDict } from "../models/floorplan-entities/item.dict";
import { ItemEnum } from "../models/floorplan-entities/item.enum";
import { BlueprintService } from "../services/blueprint.service";
import FloorPanel from "./floor-panel";
import InlineTextEdit from "./inline-text-edit";
import InlineTextareaEdit from "./inline-textarea-edit";
import Panel from "./panel";
import ToggleButtonType from "./toggle-type";
import ListItem from "./list-item";

const itemTypeList = [
  {
    key: "move",
    name: "Move",
  },
  {
    key: "draw",
    name: "Draw",
  },
  {
    key: "delete",
    name: "Delete",
  },
];

const BlueprintView = () => {
  const isToolbarOpen = useObservable({value: false});
  const canvasRef = useRef(null);
  const blueprintService = useInstance(BlueprintService);

  useEffect(() => {
    const blueprint = new Blueprint(canvasRef.current);
    blueprintService.setBlueprint(blueprint);
    return () => {
      blueprintService.destructor();
    };
  }, []);

  const onAddItem = useCallback((key: ItemEnum) => {
    blueprintService.addItem(key);
    isToolbarOpen.value = false;
  }, []);

  return (
    <Sidebar
      pullRight
      styles={{
        sidebar: {
          background: "white",
          overflowY: "auto",
          maxHeight: "calc(var(--vh, 1vh) * 100)",
        },
        content: {
          overflowY: "hidden",
          maxHeight: "calc(var(--vh, 1vh) * 100)",
        },
      }}
      open={isToolbarOpen.value}
      onSetOpen={(open: boolean) => isToolbarOpen.value = open}
      sidebar={
        <>
          {ItemArray.map((key) => <ListItem
            key={key}
            metadata={key}
            onClick={onAddItem}>
            + &nbsp;{ItemNameDict[key]}
          </ListItem>)}
        </>
      }
    >
      <div className="view">
        <canvas
          ref={canvasRef}
        />

        <div className="mode-panel">
          <ToggleButtonType
            activeState={blueprintService.mode}
            items={itemTypeList}
            onToggle={(mode) => blueprintService.changeMode(mode as string)}
          />
        </div>

        <div className="items-panel">
          <Panel>
            <div className="list-overflow">
              {ItemArray.map((key) => <ListItem
                key={key}
                borderRadius="5px"
                metadata={key}
                onClick={onAddItem}>
                + &nbsp;{ItemNameDict[key]}
              </ListItem>)}
            </div>
          </Panel>
        </div>

        <div className="property-panel">
          {blueprintService.selected ? <Panel>
            <ListItem borderRadius="5px" isHeader>
              {ItemNameDict[blueprintService.selected.type as ItemEnum]}
            </ListItem>
            <ListItem borderRadius="5px" isField>
              <InlineTextEdit
                placeholder="Write Name..."
                value={blueprintService.selected.name}
                onChange={(value) => {
                  blueprintService.selected.name = value;
                  blueprintService.applyChanges();
                }}
              />
            </ListItem>
            <ListItem borderRadius="5px" isHeader>
              Description
            </ListItem>
            <ListItem borderRadius="5px" isField>
              <InlineTextareaEdit
                borderRadius="0 0 5px 5px"
                placeholder="Write Description..."
                value={blueprintService.selected.description}
                onChange={(value) => {
                  blueprintService.selected.description = value;
                  blueprintService.applyChanges();
                }}
              />
            </ListItem>
          </Panel> : null}
        </div>

        <div className="floor-panel">
          <FloorPanel/>
        </div>

        <style jsx>{`
          .view {
            position: relative;
            width: 100vw;
            height: calc(var(--vh, 1vh) * 100);
          }

          .list-overflow {
            overflow: auto;
            max-height: calc(var(--vh, 1vh) * 100 - 20px);
          }

          .mode-panel {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
          }

          .items-panel {
            position: absolute;
            top: 20px;
            right: 20px;
            border-radius: 5px;
            width: 300px;
          }

          .property-panel {
            position: absolute;
            top: 20px;
            left: 20px;
            border-radius: 5px;
            width: 300px;
          }

          .floor-panel {
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            max-width: calc(100vw - 40px);
            width: 230px;
          }

          @media (max-width: 900px) {
            .items-panel {
              display: none;
            }

            .property-panel {
              top: 80px;
              right: 20px;
              width: unset;
            }
          }
        `}</style>
      </div>
    </Sidebar>
  );
};

export default memo(observer(BlueprintView));
