from PIL import Image
import os

def get_frame_coordinates(animation_type, frame_index, total_width, total_height):
    """
    Obtiene las coordenadas exactas para recortar cada frame según el tipo de animación.
    """
    # Definir las coordenadas de recorte para cada tipo de animación
    frame_data = {
        'idle': {
            'frame_width': 42,
            'offset_x': 0,
            'spacing': 0,
            'coordinates': [
                (0, 0, 42, 42),     # Frame 1
                (42, 0, 84, 42),    # Frame 2
                (84, 0, 126, 42),   # Frame 3
                (126, 0, 168, 42),  # Frame 4
                (168, 0, 210, 42),  # Frame 5
                (210, 0, 252, 42)   # Frame 6
            ]
        },
        'walk': {
            'frame_width': 42,
            'offset_x': 0,
            'spacing': 0
        },
        'run': {
            'frame_width': 42,
            'offset_x': 0,
            'spacing': 0
        },
        'attack': {
            'frame_width': 42,
            'offset_x': 0,
            'spacing': 0
        },
        'hurt': {
            'frame_width': 42,
            'offset_x': 0,
            'spacing': 0,
            'coordinates': [
                (0, 0, 42, 42),    # Frame 1
                (42, 0, 84, 42),   # Frame 2
                (84, 0, 126, 42)   # Frame 3
            ]
        },
        'death': {
            'frame_width': 42,
            'offset_x': 0,
            'spacing': 0,
            'coordinates': [
                (0, 0, 42, 42),     # Frame 1
                (42, 0, 84, 42),    # Frame 2
                (84, 0, 126, 42),   # Frame 3
                (126, 0, 168, 42),  # Frame 4
                (168, 0, 210, 42),  # Frame 5
                (210, 0, 252, 42)   # Frame 6
            ]
        },
        'jump': {
            'frame_width': 42,
            'offset_x': 0,
            'spacing': 0,
            'coordinates': [
                (0, 0, 42, 42),     # Frame 1
                (42, 0, 84, 42),    # Frame 2
                (84, 0, 126, 42),   # Frame 3
                (126, 0, 168, 42),  # Frame 4
                (168, 0, 210, 42),  # Frame 5
                (210, 0, 252, 42)   # Frame 6
            ]
        }
    }
    
    # Si es una animación con coordenadas predefinidas, usarlas
    if animation_type in frame_data and 'coordinates' in frame_data[animation_type]:
        if frame_index < len(frame_data[animation_type]['coordinates']):
            return frame_data[animation_type]['coordinates'][frame_index]
    
    # Para otras animaciones, calcular las coordenadas basadas en el ancho del frame
    if animation_type in frame_data:
        data = frame_data[animation_type]
        frame_width = data['frame_width']
        offset_x = data['offset_x']
        spacing = data['spacing']
        
        left = (frame_width + spacing) * frame_index + offset_x
        right = left + frame_width
        
        # Asegurarse de que no nos pasamos del ancho total
        if right > total_width:
            right = total_width
            
        return (left, 0, right, total_height)
    
    # Si no es un tipo conocido, usar división simple
    frame_width = total_width // 6  # Asumimos 6 frames por defecto
    left = frame_width * frame_index
    right = left + frame_width
    return (left, 0, right, total_height)

def remove_background(image):
    """
    Elimina el fondo naranja/rojo de la imagen y lo hace transparente.
    """
    # Convertir a RGBA si no lo está ya
    if image.mode != 'RGBA':
        image = image.convert('RGBA')
    
    # Obtener los datos de píxeles
    data = image.getdata()
    new_data = []
    
    for item in data:
        # Si el píxel es naranja/rojo (R > 200, G < 150), hacerlo transparente
        if item[0] > 200 and item[1] < 150:
            new_data.append((0, 0, 0, 0))
        else:
            new_data.append(item)
    
    # Crear nueva imagen con los datos modificados
    new_image = Image.new('RGBA', image.size)
    new_image.putdata(new_data)
    return new_image

def split_sprite_sheet(input_path, output_dir, num_frames, animation_type=None):
    """
    Divide un sprite sheet en frames individuales.
    
    Args:
        input_path (str): Ruta al archivo del sprite sheet
        output_dir (str): Directorio donde guardar los frames
        num_frames (int): Número de frames en el sprite sheet
        animation_type (str): Tipo de animación ('jump', 'hurt', 'death', None)
    """
    # Crear el directorio de salida si no existe
    os.makedirs(output_dir, exist_ok=True)
    
    # Abrir la imagen
    with Image.open(input_path) as img:
        # Convertir a RGBA para manejar transparencia
        img = img.convert('RGBA')
        
        # Obtener dimensiones totales
        total_width, total_height = img.size
        
        print(f'\nProcesando {animation_type}: {input_path}')
        print(f'Dimensiones de la imagen: {total_width}x{total_height}')
        
        # Obtener los datos de la animación
        frame_data = get_frame_coordinates(animation_type, 0, total_width, total_height)
        if isinstance(frame_data, tuple):
            # Si es una tupla, son las coordenadas del primer frame
            frame_width = frame_data[2] - frame_data[0]
            print(f'Ancho de frame detectado: {frame_width}px')
        else:
            # Si no, es un diccionario con la configuración
            frame_width = frame_data.get('frame_width', total_width // num_frames)
            print(f'Ancho de frame configurado: {frame_width}px')
        
        # Para cada frame
        for i in range(num_frames):
            # Obtener las coordenadas específicas para este frame
            coords = get_frame_coordinates(animation_type, i, total_width, total_height)
            if isinstance(coords, tuple):
                left, top, right, bottom = coords
            else:
                # Si no hay coordenadas específicas, calcular basado en el ancho del frame
                left = i * frame_width
                right = left + frame_width
                top = 0
                bottom = total_height
            
            # Extraer el frame
            frame = img.crop((left, top, right, bottom))
            
            # Eliminar el fondo naranja/rojo
            frame = remove_background(frame)
            
            # Guardar el frame con transparencia
            output_path = os.path.join(output_dir, f'frame{i+1}.png')
            frame.save(output_path, 'PNG')
            print(f'Frame {i+1} guardado: {output_path} ({left}, {top}, {right}, {bottom})')

def process_enemy_sprites(enemy_type):
    """
    Procesa todos los sprites de un tipo de enemigo.
    
    Args:
        enemy_type (str): Tipo de enemigo (2 o 3)
    """
    # Configuración de las animaciones con sus tipos específicos
    animations = {
        'Idle': {'frames': 6, 'type': 'idle'},
        'Walk': {'frames': 6, 'type': 'walk'},
        'Attack1': {'frames': 6, 'type': 'attack'},
        'Hurt': {'frames': 3, 'type': 'hurt'},
        'Death': {'frames': 6, 'type': 'death'},
        'Run': {'frames': 6, 'type': 'run'},
        'Jump': {'frames': 6, 'type': 'jump'}
    }
    
    # Para cada animación
    for anim_name, config in animations.items():
        input_path = f'sprites/{enemy_type}/{anim_name}.png'
        if not os.path.exists(input_path):
            print(f'Advertencia: No se encontró {input_path}')
            continue
            
        # Convertir el nombre de la animación a minúsculas para el directorio de salida
        anim_lower = anim_name.lower()
        if anim_name == 'Attack1':
            anim_lower = 'attack'
            
        output_dir = f'sprites/enemy{enemy_type}/{anim_lower}'
        print(f'\nProcesando {config["type"]}: {input_path}')
        split_sprite_sheet(input_path, output_dir, config['frames'], config['type'])

def main():
    """
    Función principal que procesa los sprites de todos los enemigos.
    """
    # Procesar sprites para los enemigos tipo 2 y 3
    for enemy_type in ['2', '3']:
        print(f'\nProcesando sprites del enemigo tipo {enemy_type}...')
        process_enemy_sprites(enemy_type)

if __name__ == '__main__':
    main()
