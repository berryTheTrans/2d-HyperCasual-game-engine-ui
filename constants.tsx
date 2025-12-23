
import { ArchitectureModule } from './types.ts';

export const ARCHITECTURE_DATA: ArchitectureModule[] = [
  {
    name: "Core ECS & SceneObject",
    description: "The base Entity-Component-System foundation. SceneObject manages a collection of modular components.",
    classes: ["Component", "SceneObject", "Scene", "EntityManager"],
    snippet: `// SceneObject.h
class Component;
class SceneObject {
public:
    uint32_t id;
    std::string name;
    
    template<typename T, typename... Args>
    T& AddComponent(Args&&... args) {
        auto comp = std::make_unique<T>(std::forward<Args>(args)...);
        comp->owner = this;
        m_Components.push_back(std::move(comp));
        return static_cast<T&>(*m_Components.back());
    }

    void Update(float dt) {
        for(auto& comp : m_Components) comp->OnUpdate(dt);
    }

private:
    std::vector<std::unique_ptr<Component>> m_Components;
};`
  },
  {
    name: "Transform & Physics (Box2D)",
    description: "Handles spatial data and integrates with Box2D for rigid-body dynamics and collision detection.",
    classes: ["TransformComponent", "Rigidbody2D", "BoxCollider2D", "PhysicsWorld"],
    snippet: `// PhysicsComponents.h
struct TransformComponent : public Component {
    Vector2 position;
    float rotation;
    Vector2 scale = {1, 1};
};

class Rigidbody2D : public Component {
public:
    float mass = 1.0f;
    float gravityScale = 1.0f;
    bool isFixedRotation = false;
    
    void ApplyForce(Vector2 force);
private:
    b2Body* m_RuntimeBody; // Box2D Integration
};`
  },
  {
    name: "Rendering & Animation",
    description: "Manages sprite drawing, vertex color tinting, and keyframe-based sprite animations.",
    classes: ["SpriteRenderer", "Animator", "AnimationClip", "RenderQueue"],
    snippet: `// GraphicsComponents.h
class SpriteRenderer : public Component {
public:
    Texture* sprite;
    Color tint = {1, 1, 1, 1};
    int zOrder = 0;
    
    void OnRender(Renderer& renderer) override {
        renderer.Draw(sprite, owner->transform, tint, zOrder);
    }
};

class Animator : public Component {
public:
    void Play(std::string clipName);
    void Update(float dt);
private:
    std::map<std::string, AnimationClip> m_Clips;
    float m_CurrentFrameTime;
};`
  },
  {
    name: "Scripting & Behavior (V8/Lua)",
    description: "Bridges native C++ events to high-level scripts. Supports hot-reloading and event hooks.",
    classes: ["ScriptComponent", "Behavior", "EventSystem", "ScriptRegistry"],
    snippet: `// Scripting.h
class ScriptComponent : public Component {
public:
    std::string scriptPath;
    
    void OnUpdate(float dt) override {
        // Execute JS hook: onUpdate(dt)
        ScriptEngine::Execute(m_InstanceId, "onUpdate", dt);
    }
    
    void OnCollision(Entity* other) {
        ScriptEngine::Execute(m_InstanceId, "onCollision", other->id);
    }
private:
    uint32_t m_InstanceId;
};`
  }
];
